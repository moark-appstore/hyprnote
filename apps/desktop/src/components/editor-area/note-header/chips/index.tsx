import { EventChip } from "./event-chip";
import { PastNotesChip } from "./past-notes-chip";
import { TagChip } from "./tag-chip";

export default function NoteHeaderChips({ sessionId, hashtags = [] }: {
  sessionId: string;
  hashtags?: string[];
}) {
  return (
    <div className="-mx-1.5 flex flex-row items-center overflow-x-auto scrollbar-none whitespace-nowrap">
      <EventChip sessionId={sessionId} />
      <TagChip sessionId={sessionId} hashtags={hashtags} />
      <PastNotesChip sessionId={sessionId} />
    </div>
  );
}
