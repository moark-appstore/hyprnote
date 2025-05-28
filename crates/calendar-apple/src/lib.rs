use itertools::Itertools;
use std::time::Duration;

use block2::RcBlock;
use objc2::{
    rc::Retained,
    runtime::{Bool, ProtocolObject},
    ClassType,
};
use objc2_contacts::{CNAuthorizationStatus, CNContactStore, CNEntityType, CNKeyDescriptor};
use objc2_event_kit::{
    EKAuthorizationStatus, EKCalendar, EKEntityType, EKEventStore, EKParticipant,
};
use objc2_foundation::{NSArray, NSDate, NSError, NSPredicate, NSString};

use hypr_calendar_interface::{
    Calendar, CalendarSource, Error, Event, EventFilter, Participant, Platform,
};

pub struct Handle {
    event_store: Retained<EKEventStore>,
    contacts_store: Retained<CNContactStore>,
    calendar_access_granted: bool,
    contacts_access_granted: bool,
}

#[allow(clippy::new_without_default)]
impl Handle {
    pub fn new() -> Self {
        let event_store = unsafe { EKEventStore::new() };
        let contacts_store = unsafe { CNContactStore::new() };

        let mut handle = Self {
            event_store,
            contacts_store,
            calendar_access_granted: false,
            contacts_access_granted: false,
        };

        handle.calendar_access_granted = handle.calendar_access_status();
        handle.contacts_access_granted = handle.contacts_access_status();

        handle
    }

    pub fn request_calendar_access(&mut self) {
        if self.calendar_access_granted {
            return;
        }

        let (tx, rx) = std::sync::mpsc::channel::<bool>();
        let completion = RcBlock::new(move |granted: Bool, _error: *mut NSError| {
            let _ = tx.send(granted.as_bool());
        });

        unsafe {
            self.event_store
                .requestFullAccessToEventsWithCompletion(&*completion as *const _ as *mut _)
        };

        match rx.recv_timeout(Duration::from_secs(5)) {
            Ok(true) => self.calendar_access_granted = true,
            _ => self.calendar_access_granted = false,
        }
    }

    pub fn request_contacts_access(&mut self) {
        if self.contacts_access_granted {
            return;
        }

        let (tx, rx) = std::sync::mpsc::channel::<bool>();
        let completion = RcBlock::new(move |granted: Bool, _error: *mut NSError| {
            let _ = tx.send(granted.as_bool());
        });

        unsafe {
            self.contacts_store
                .requestAccessForEntityType_completionHandler(CNEntityType::Contacts, &completion);
        };

        match rx.recv_timeout(Duration::from_secs(5)) {
            Ok(true) => self.contacts_access_granted = true,
            _ => self.contacts_access_granted = false,
        }
    }

    pub fn calendar_access_status(&self) -> bool {
        let status = unsafe { EKEventStore::authorizationStatusForEntityType(EKEntityType::Event) };
        matches!(status, EKAuthorizationStatus::FullAccess)
    }

    pub fn contacts_access_status(&self) -> bool {
        let status =
            unsafe { CNContactStore::authorizationStatusForEntityType(CNEntityType::Contacts) };
        matches!(status, CNAuthorizationStatus::Authorized)
    }

    fn events_predicate(&self, filter: &EventFilter) -> Retained<NSPredicate> {
        let start_date = unsafe {
            NSDate::initWithTimeIntervalSince1970(NSDate::alloc(), filter.from.timestamp() as f64)
        };
        let end_date = unsafe {
            NSDate::initWithTimeIntervalSince1970(NSDate::alloc(), filter.to.timestamp() as f64)
        };

        let calendars = unsafe { self.event_store.calendars() };
        let calendars: Retained<NSArray<EKCalendar>> = calendars
            .into_iter()
            .filter(|c| {
                let id = unsafe { c.calendarIdentifier() }.to_string();
                filter.calendar_tracking_id.eq(&id)
            })
            .collect();

        unsafe {
            self.event_store
                .predicateForEventsWithStartDate_endDate_calendars(
                    &start_date,
                    &end_date,
                    Some(&calendars),
                )
        }
    }

    fn transform_participant(&self, participant: &EKParticipant) -> Participant {
        let name = unsafe { participant.name() }
            .unwrap_or_default()
            .to_string();

        let email = {
            if !self.contacts_access_granted {
                None
            } else {
                let email_string = NSString::from_str("emailAddresses");
                let cnkey_email: Retained<ProtocolObject<dyn CNKeyDescriptor>> =
                    ProtocolObject::from_retained(email_string);
                let keys = NSArray::from_vec(vec![cnkey_email]);

                let contact_pred = unsafe { participant.contactPredicate() };
                let contact = unsafe {
                    self.contacts_store
                        .unifiedContactsMatchingPredicate_keysToFetch_error(&contact_pred, &keys)
                }
                .unwrap_or_default();

                let email = contact.first().and_then(|contact| {
                    let emails = unsafe { contact.emailAddresses() };

                    emails
                        .first()
                        .map(|email| unsafe { email.value() }.to_string())
                });

                email
            }
        };

        Participant { name, email }
    }
}

impl CalendarSource for Handle {
    async fn list_calendars(&self) -> Result<Vec<Calendar>, Error> {
        if !self.calendar_access_granted {
            return Err(anyhow::anyhow!("calendar_access_denied"));
        }

        let calendars = unsafe { self.event_store.calendars() };

        let list = calendars
            .iter()
            .map(|calendar| {
                // https://docs.rs/objc2-event-kit/latest/objc2_event_kit/struct.EKCalendar.html
                // https://developer.apple.com/documentation/eventkit/ekcalendar
                // https://developer.apple.com/documentation/eventkit/ekevent/eventidentifier
                // If the calendar of an event changes, its identifier most likely changes as well.
                let id = unsafe { calendar.calendarIdentifier() };
                let title = unsafe { calendar.title() };

                // https://developer.apple.com/documentation/eventkit/eksource
                let source = unsafe { calendar.source().unwrap() };
                let source_title = unsafe { source.as_ref().title() };

                Calendar {
                    id: id.to_string(),
                    platform: Platform::Apple,
                    name: title.to_string(),
                    source: Some(source_title.to_string()),
                }
            })
            .sorted_by(|a, b| a.name.cmp(&b.name))
            .collect();

        Ok(list)
    }

    async fn list_events(&self, filter: EventFilter) -> Result<Vec<Event>, Error> {
        if !self.calendar_access_granted {
            return Err(anyhow::anyhow!("calendar_access_denied"));
        }

        let predicate = self.events_predicate(&filter);
        let events = unsafe { self.event_store.eventsMatchingPredicate(&predicate) };

        let list = events
            .iter()
            .filter_map(|event| {
                // https://docs.rs/objc2-event-kit/latest/objc2_event_kit/struct.EKEvent.html
                // https://developer.apple.com/documentation/eventkit/ekevent
                let id = unsafe { event.eventIdentifier() }.unwrap();
                let title = unsafe { event.title() };
                let note = unsafe { event.notes().unwrap_or_default() };
                let start_date = unsafe { event.startDate() };
                let end_date = unsafe { event.endDate() };

                let calendar = unsafe { event.calendar() }.unwrap();
                let calendar_id = unsafe { calendar.calendarIdentifier() };

                // This is theoretically not needed, but it seems like the 'calendars' filter does not work in the predicate.
                if !filter.calendar_tracking_id.eq(&calendar_id.to_string()) {
                    return None;
                }

                let participants = unsafe { event.attendees().unwrap_or_default() };
                let participants = participants
                    .iter()
                    .map(|p| self.transform_participant(p))
                    .collect();

                Some(Event {
                    id: id.to_string(),
                    calendar_id: calendar_id.to_string(),
                    platform: Platform::Apple,
                    name: title.to_string(),
                    note: note.to_string(),
                    participants,
                    start_date: offset_date_time_from(start_date),
                    end_date: offset_date_time_from(end_date),
                    google_event_url: None,
                })
            })
            .sorted_by(|a, b| a.start_date.cmp(&b.start_date))
            .collect();

        Ok(list)
    }
}

fn offset_date_time_from(date: Retained<NSDate>) -> chrono::DateTime<chrono::Utc> {
    let seconds = unsafe { date.timeIntervalSinceReferenceDate() };

    // Cocoa reference date is January 1, 2001, 00:00:00 UTC
    let cocoa_reference: chrono::DateTime<chrono::Utc> =
        chrono::DateTime::from_naive_utc_and_offset(
            chrono::NaiveDateTime::new(
                chrono::NaiveDate::from_ymd_opt(2001, 1, 1).unwrap(),
                chrono::NaiveTime::from_hms_opt(0, 0, 0).unwrap(),
            ),
            chrono::Utc,
        );

    let unix_timestamp = seconds + cocoa_reference.timestamp() as f64;
    chrono::DateTime::<chrono::Utc>::from_timestamp(unix_timestamp as i64, 0).unwrap()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_time() {
        let now = unsafe { NSDate::new() };
        let now_from_nsdate = offset_date_time_from(now.to_owned());
        let now_from_chrono = chrono::Utc::now();
        let diff = (now_from_nsdate - now_from_chrono).num_seconds().abs();
        assert!(diff < 1);
    }

    #[tokio::test]
    async fn test_request_access() {
        let mut handle = Handle::new();
        handle.request_calendar_access();
        handle.request_contacts_access();
    }

    #[tokio::test]
    async fn test_list_calendars() {
        let handle = Handle::new();
        let calendars = handle.list_calendars().await.unwrap();
        assert!(!calendars.is_empty());
    }

    #[tokio::test]
    async fn test_list_events() {
        let handle = Handle::new();
        let filter = EventFilter {
            calendar_tracking_id: "".to_string(),
            from: chrono::Utc::now() - chrono::Duration::days(100),
            to: chrono::Utc::now() + chrono::Duration::days(100),
        };

        let events = handle.list_events(filter).await.unwrap();
        assert!(events.is_empty());
    }
}
