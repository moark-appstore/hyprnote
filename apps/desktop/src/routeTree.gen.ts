/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as VideoImport } from './routes/video'
import { Route as AppImport } from './routes/app'
import { Route as AppIndexImport } from './routes/app.index'
import { Route as AppSubscriptionImport } from './routes/app.subscription'
import { Route as AppSettingsImport } from './routes/app.settings'
import { Route as AppPlansImport } from './routes/app.plans'
import { Route as AppNewImport } from './routes/app.new'
import { Route as AppCalendarImport } from './routes/app.calendar'
import { Route as AppOrganizationIdImport } from './routes/app.organization.$id'
import { Route as AppNoteIdImport } from './routes/app.note.$id'
import { Route as AppHumanIdImport } from './routes/app.human.$id'
import { Route as AppNoteEventIdImport } from './routes/app.note.event.$id'

// Create/Update Routes

const VideoRoute = VideoImport.update({
  id: '/video',
  path: '/video',
  getParentRoute: () => rootRoute,
} as any)

const AppRoute = AppImport.update({
  id: '/app',
  path: '/app',
  getParentRoute: () => rootRoute,
} as any)

const AppIndexRoute = AppIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => AppRoute,
} as any)

const AppSubscriptionRoute = AppSubscriptionImport.update({
  id: '/subscription',
  path: '/subscription',
  getParentRoute: () => AppRoute,
} as any)

const AppSettingsRoute = AppSettingsImport.update({
  id: '/settings',
  path: '/settings',
  getParentRoute: () => AppRoute,
} as any)

const AppPlansRoute = AppPlansImport.update({
  id: '/plans',
  path: '/plans',
  getParentRoute: () => AppRoute,
} as any)

const AppNewRoute = AppNewImport.update({
  id: '/new',
  path: '/new',
  getParentRoute: () => AppRoute,
} as any)

const AppCalendarRoute = AppCalendarImport.update({
  id: '/calendar',
  path: '/calendar',
  getParentRoute: () => AppRoute,
} as any)

const AppOrganizationIdRoute = AppOrganizationIdImport.update({
  id: '/organization/$id',
  path: '/organization/$id',
  getParentRoute: () => AppRoute,
} as any)

const AppNoteIdRoute = AppNoteIdImport.update({
  id: '/note/$id',
  path: '/note/$id',
  getParentRoute: () => AppRoute,
} as any)

const AppHumanIdRoute = AppHumanIdImport.update({
  id: '/human/$id',
  path: '/human/$id',
  getParentRoute: () => AppRoute,
} as any)

const AppNoteEventIdRoute = AppNoteEventIdImport.update({
  id: '/note/event/$id',
  path: '/note/event/$id',
  getParentRoute: () => AppRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/app': {
      id: '/app'
      path: '/app'
      fullPath: '/app'
      preLoaderRoute: typeof AppImport
      parentRoute: typeof rootRoute
    }
    '/video': {
      id: '/video'
      path: '/video'
      fullPath: '/video'
      preLoaderRoute: typeof VideoImport
      parentRoute: typeof rootRoute
    }
    '/app/calendar': {
      id: '/app/calendar'
      path: '/calendar'
      fullPath: '/app/calendar'
      preLoaderRoute: typeof AppCalendarImport
      parentRoute: typeof AppImport
    }
    '/app/new': {
      id: '/app/new'
      path: '/new'
      fullPath: '/app/new'
      preLoaderRoute: typeof AppNewImport
      parentRoute: typeof AppImport
    }
    '/app/plans': {
      id: '/app/plans'
      path: '/plans'
      fullPath: '/app/plans'
      preLoaderRoute: typeof AppPlansImport
      parentRoute: typeof AppImport
    }
    '/app/settings': {
      id: '/app/settings'
      path: '/settings'
      fullPath: '/app/settings'
      preLoaderRoute: typeof AppSettingsImport
      parentRoute: typeof AppImport
    }
    '/app/subscription': {
      id: '/app/subscription'
      path: '/subscription'
      fullPath: '/app/subscription'
      preLoaderRoute: typeof AppSubscriptionImport
      parentRoute: typeof AppImport
    }
    '/app/': {
      id: '/app/'
      path: '/'
      fullPath: '/app/'
      preLoaderRoute: typeof AppIndexImport
      parentRoute: typeof AppImport
    }
    '/app/human/$id': {
      id: '/app/human/$id'
      path: '/human/$id'
      fullPath: '/app/human/$id'
      preLoaderRoute: typeof AppHumanIdImport
      parentRoute: typeof AppImport
    }
    '/app/note/$id': {
      id: '/app/note/$id'
      path: '/note/$id'
      fullPath: '/app/note/$id'
      preLoaderRoute: typeof AppNoteIdImport
      parentRoute: typeof AppImport
    }
    '/app/organization/$id': {
      id: '/app/organization/$id'
      path: '/organization/$id'
      fullPath: '/app/organization/$id'
      preLoaderRoute: typeof AppOrganizationIdImport
      parentRoute: typeof AppImport
    }
    '/app/note/event/$id': {
      id: '/app/note/event/$id'
      path: '/note/event/$id'
      fullPath: '/app/note/event/$id'
      preLoaderRoute: typeof AppNoteEventIdImport
      parentRoute: typeof AppImport
    }
  }
}

// Create and export the route tree

interface AppRouteChildren {
  AppCalendarRoute: typeof AppCalendarRoute
  AppNewRoute: typeof AppNewRoute
  AppPlansRoute: typeof AppPlansRoute
  AppSettingsRoute: typeof AppSettingsRoute
  AppSubscriptionRoute: typeof AppSubscriptionRoute
  AppIndexRoute: typeof AppIndexRoute
  AppHumanIdRoute: typeof AppHumanIdRoute
  AppNoteIdRoute: typeof AppNoteIdRoute
  AppOrganizationIdRoute: typeof AppOrganizationIdRoute
  AppNoteEventIdRoute: typeof AppNoteEventIdRoute
}

const AppRouteChildren: AppRouteChildren = {
  AppCalendarRoute: AppCalendarRoute,
  AppNewRoute: AppNewRoute,
  AppPlansRoute: AppPlansRoute,
  AppSettingsRoute: AppSettingsRoute,
  AppSubscriptionRoute: AppSubscriptionRoute,
  AppIndexRoute: AppIndexRoute,
  AppHumanIdRoute: AppHumanIdRoute,
  AppNoteIdRoute: AppNoteIdRoute,
  AppOrganizationIdRoute: AppOrganizationIdRoute,
  AppNoteEventIdRoute: AppNoteEventIdRoute,
}

const AppRouteWithChildren = AppRoute._addFileChildren(AppRouteChildren)

export interface FileRoutesByFullPath {
  '/app': typeof AppRouteWithChildren
  '/video': typeof VideoRoute
  '/app/calendar': typeof AppCalendarRoute
  '/app/new': typeof AppNewRoute
  '/app/plans': typeof AppPlansRoute
  '/app/settings': typeof AppSettingsRoute
  '/app/subscription': typeof AppSubscriptionRoute
  '/app/': typeof AppIndexRoute
  '/app/human/$id': typeof AppHumanIdRoute
  '/app/note/$id': typeof AppNoteIdRoute
  '/app/organization/$id': typeof AppOrganizationIdRoute
  '/app/note/event/$id': typeof AppNoteEventIdRoute
}

export interface FileRoutesByTo {
  '/video': typeof VideoRoute
  '/app/calendar': typeof AppCalendarRoute
  '/app/new': typeof AppNewRoute
  '/app/plans': typeof AppPlansRoute
  '/app/settings': typeof AppSettingsRoute
  '/app/subscription': typeof AppSubscriptionRoute
  '/app': typeof AppIndexRoute
  '/app/human/$id': typeof AppHumanIdRoute
  '/app/note/$id': typeof AppNoteIdRoute
  '/app/organization/$id': typeof AppOrganizationIdRoute
  '/app/note/event/$id': typeof AppNoteEventIdRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/app': typeof AppRouteWithChildren
  '/video': typeof VideoRoute
  '/app/calendar': typeof AppCalendarRoute
  '/app/new': typeof AppNewRoute
  '/app/plans': typeof AppPlansRoute
  '/app/settings': typeof AppSettingsRoute
  '/app/subscription': typeof AppSubscriptionRoute
  '/app/': typeof AppIndexRoute
  '/app/human/$id': typeof AppHumanIdRoute
  '/app/note/$id': typeof AppNoteIdRoute
  '/app/organization/$id': typeof AppOrganizationIdRoute
  '/app/note/event/$id': typeof AppNoteEventIdRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/app'
    | '/video'
    | '/app/calendar'
    | '/app/new'
    | '/app/plans'
    | '/app/settings'
    | '/app/subscription'
    | '/app/'
    | '/app/human/$id'
    | '/app/note/$id'
    | '/app/organization/$id'
    | '/app/note/event/$id'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/video'
    | '/app/calendar'
    | '/app/new'
    | '/app/plans'
    | '/app/settings'
    | '/app/subscription'
    | '/app'
    | '/app/human/$id'
    | '/app/note/$id'
    | '/app/organization/$id'
    | '/app/note/event/$id'
  id:
    | '__root__'
    | '/app'
    | '/video'
    | '/app/calendar'
    | '/app/new'
    | '/app/plans'
    | '/app/settings'
    | '/app/subscription'
    | '/app/'
    | '/app/human/$id'
    | '/app/note/$id'
    | '/app/organization/$id'
    | '/app/note/event/$id'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  AppRoute: typeof AppRouteWithChildren
  VideoRoute: typeof VideoRoute
}

const rootRouteChildren: RootRouteChildren = {
  AppRoute: AppRouteWithChildren,
  VideoRoute: VideoRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/app",
        "/video"
      ]
    },
    "/app": {
      "filePath": "app.tsx",
      "children": [
        "/app/calendar",
        "/app/new",
        "/app/plans",
        "/app/settings",
        "/app/subscription",
        "/app/",
        "/app/human/$id",
        "/app/note/$id",
        "/app/organization/$id",
        "/app/note/event/$id"
      ]
    },
    "/video": {
      "filePath": "video.tsx"
    },
    "/app/calendar": {
      "filePath": "app.calendar.tsx",
      "parent": "/app"
    },
    "/app/new": {
      "filePath": "app.new.tsx",
      "parent": "/app"
    },
    "/app/plans": {
      "filePath": "app.plans.tsx",
      "parent": "/app"
    },
    "/app/settings": {
      "filePath": "app.settings.tsx",
      "parent": "/app"
    },
    "/app/subscription": {
      "filePath": "app.subscription.tsx",
      "parent": "/app"
    },
    "/app/": {
      "filePath": "app.index.tsx",
      "parent": "/app"
    },
    "/app/human/$id": {
      "filePath": "app.human.$id.tsx",
      "parent": "/app"
    },
    "/app/note/$id": {
      "filePath": "app.note.$id.tsx",
      "parent": "/app"
    },
    "/app/organization/$id": {
      "filePath": "app.organization.$id.tsx",
      "parent": "/app"
    },
    "/app/note/event/$id": {
      "filePath": "app.note.event.$id.tsx",
      "parent": "/app"
    }
  }
}
ROUTE_MANIFEST_END */
