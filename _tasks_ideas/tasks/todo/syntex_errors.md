> rest-express@1.0.0 lint
> eslint client server shared config scripts --ext .ts,.tsx,.js,.jsx


/root/travel_app/client/src/App.tsx
  21:43  error  'React' is not defined  no-undef
  34:52  error  'React' is not defined  no-undef

/root/travel_app/client/src/components/accommodations/accommodation-card.tsx
   3:34  error  'Building' is defined but never used       no-unused-vars
  10:12  error  'accommodation' is defined but never used  no-unused-vars
  11:14  error  'id' is defined but never used             no-unused-vars
  12:12  error  'accommodation' is defined but never used  no-unused-vars

/root/travel_app/client/src/components/activities/activity-card.tsx
  10:12  error  'activity' is defined but never used  no-unused-vars
  11:14  error  'id' is defined but never used        no-unused-vars
  12:12  error  'activity' is defined but never used  no-unused-vars

/root/travel_app/client/src/components/common/mobile-sidebar.tsx
   3:10  error  'motion' is defined but never used           no-unused-vars
   3:18  error  'AnimatePresence' is defined but never used  no-unused-vars
  16:3   error  'X' is defined but never used                no-unused-vars
  24:10  error  '_' is assigned a value but never used       no-unused-vars

/root/travel_app/client/src/components/common/sidebar.tsx
  10:10  error  '_' is assigned a value but never used  no-unused-vars

/root/travel_app/client/src/components/destinations/destination-card.tsx
   4:26  error  'MapPin' is defined but never used       no-unused-vars
  12:12  error  'destination' is defined but never used  no-unused-vars
  13:14  error  'id' is defined but never used           no-unused-vars
  14:12  error  'destination' is defined but never used  no-unused-vars

/root/travel_app/client/src/components/forms/accommodation-form.tsx
   58:18  error  'open' is defined but never used              no-unused-vars
   59:14  error  'values' is defined but never used            no-unused-vars
   60:14  error  'error' is defined but never used             no-unused-vars
  103:33  error  'error' is defined but never used             no-unused-vars
  113:7   error  'onError' is assigned a value but never used  no-unused-vars
  164:11  error  'toast' is assigned a value but never used    no-unused-vars
  228:16  error  'jsonError' is defined but never used         no-unused-vars
  232:14  error  'parseError' is defined but never used        no-unused-vars

/root/travel_app/client/src/components/forms/activity-form.tsx
  50:18  error  'open' is defined but never used    no-unused-vars
  51:14  error  'values' is defined but never used  no-unused-vars

/root/travel_app/client/src/components/forms/destination-form.tsx
  49:18  error  'open' is defined but never used    no-unused-vars
  50:14  error  'values' is defined but never used  no-unused-vars

/root/travel_app/client/src/components/forms/trip-form.tsx
   4:16  error  'Destination' is defined but never used  no-unused-vars
  23:10  error  'useQuery' is defined but never used     no-unused-vars
  41:18  error  'open' is defined but never used         no-unused-vars
  42:14  error  'values' is defined but never used       no-unused-vars

/root/travel_app/client/src/components/trips/trip-card.tsx
   3:10  error  'StatusBadge' is defined but never used  no-unused-vars
   6:20  error  'Clock' is defined but never used        no-unused-vars
   6:27  error  'MapPin' is defined but never used       no-unused-vars
  20:12  error  'id' is defined but never used           no-unused-vars

/root/travel_app/client/src/components/ui/accommodation-card.tsx
   3:34  error  'Building' is defined but never used       no-unused-vars
  10:12  error  'accommodation' is defined but never used  no-unused-vars
  11:14  error  'id' is defined but never used             no-unused-vars
  12:12  error  'accommodation' is defined but never used  no-unused-vars

/root/travel_app/client/src/components/ui/activity-card.tsx
  10:12  error  'activity' is defined but never used  no-unused-vars
  11:14  error  'id' is defined but never used        no-unused-vars
  12:12  error  'activity' is defined but never used  no-unused-vars

/root/travel_app/client/src/components/ui/calendar.tsx
  55:22  error  'className' is missing in props validation  react/prop-types
  58:23  error  'className' is missing in props validation  react/prop-types

/root/travel_app/client/src/components/ui/carousel.tsx
  19:13  error  'api' is defined but never used  no-unused-vars

/root/travel_app/client/src/components/ui/chart.tsx
  12:4  error  'k' is defined but never used  no-unused-vars

/root/travel_app/client/src/components/ui/command.tsx
  40:52  error  Unknown property 'cmdk-input-wrapper' found  react/no-unknown-property

/root/travel_app/client/src/components/ui/destination-card.tsx
   4:26  error  'MapPin' is defined but never used       no-unused-vars
  12:12  error  'destination' is defined but never used  no-unused-vars
  13:14  error  'id' is defined but never used           no-unused-vars
  14:12  error  'destination' is defined but never used  no-unused-vars

/root/travel_app/client/src/components/ui/resizable.tsx
  11:4  error  'React' is not defined  no-undef
  27:4  error  'React' is not defined  no-undef

/root/travel_app/client/src/components/ui/search-filter.tsx
  14:14  error  'value' is defined but never used  no-unused-vars
  19:20  error  'value' is defined but never used  no-unused-vars

/root/travel_app/client/src/components/ui/sidebar.tsx
  11:10  error  'isMobile' is assigned a value but never used  no-unused-vars

/root/travel_app/client/src/components/ui/skeleton.tsx
  6:4  error  'React' is not defined  no-undef

/root/travel_app/client/src/components/ui/table.tsx
  72:6  error  'className' is missing in props validation  react/prop-types
  87:6  error  'className' is missing in props validation  react/prop-types

/root/travel_app/client/src/components/ui/trip-card.tsx
   3:10  error  'StatusBadge' is defined but never used  no-unused-vars
   6:20  error  'Clock' is defined but never used        no-unused-vars
   6:27  error  'MapPin' is defined but never used       no-unused-vars
  16:12  error  'id' is defined but never used           no-unused-vars

/root/travel_app/client/src/hooks/use-auth.tsx
   3:16  error  'InsertUser' is defined but never used  no-unused-vars
  55:16  error  'error' is defined but never used       no-unused-vars

/root/travel_app/client/src/hooks/use-toast.ts
  129:25  error  'state' is defined but never used  no-unused-vars

/root/travel_app/client/src/lib/protected-route.tsx
  10:20  error  'React' is not defined  no-undef

/root/travel_app/client/src/lib/queryClient.ts
  10:58  error  'TResponseData' is defined but never used  no-unused-vars

/root/travel_app/client/src/pages/accommodations.tsx
   8:29  error  'AccommodationFormProps' is defined but never used  no-unused-vars
  11:10  error  'apiRequest' is defined but never used              no-unused-vars
  36:35  error  'error' is defined but never used                   no-unused-vars

/root/travel_app/client/src/pages/activities.tsx
  11:10  error  'apiRequest' is defined but never used  no-unused-vars

/root/travel_app/client/src/pages/auth-page.tsx
  37:10  error  '_' is assigned a value but never used  no-unused-vars

/root/travel_app/client/src/pages/dashboard.tsx
    5:10  error  'Card' is defined but never used                            no-unused-vars
    5:16  error  'CardContent' is defined but never used                     no-unused-vars
    9:45  error  'Clock' is defined but never used                           no-unused-vars
   10:29  error  'InsertTrip' is defined but never used                      no-unused-vars
   36:35  error  'isLoadingTrips' is assigned a value but never used         no-unused-vars
   41:42  error  'isLoadingDestinations' is assigned a value but never used  no-unused-vars
   64:14  error  'error' is defined but never used                           no-unused-vars
  108:32  error  'trip' is defined but never used                            no-unused-vars

/root/travel_app/client/src/pages/destinations.tsx
  14:11  error  'FilterOption' is defined but never used  no-unused-vars

/root/travel_app/client/src/pages/settings.tsx
   12:27  error  'Globe' is defined but never used                                no-unused-vars
   12:52  error  'HelpCircle' is defined but never used                           no-unused-vars
  269:64  error  `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`  react/no-unescaped-entities

/root/travel_app/client/src/pages/trip-builder.tsx
    9:29  error  'CardFooter' is defined but never used  no-unused-vars
   15:24  error  'Plus' is defined but never used        no-unused-vars
   19:10  error  'Badge' is defined but never used       no-unused-vars
  104:15  error  'error' is defined but never used       no-unused-vars
  344:66  error  'JSX' is not defined                    no-undef
  380:63  error  'JSX' is not defined                    no-undef
  449:70  error  'JSX' is not defined                    no-undef
  469:62  error  'JSX' is not defined                    no-undef
  515:84  error  'JSX' is not defined                    no-undef
  535:66  error  'JSX' is not defined                    no-undef

/root/travel_app/client/src/pages/trips.tsx
    5:16  error  'Calendar' is defined but never used                 no-unused-vars
   14:10  error  'StatusBadge' is defined but never used              no-unused-vars
   15:10  error  'format' is defined but never used                   no-unused-vars
   16:10  error  'Card' is defined but never used                     no-unused-vars
   16:16  error  'CardContent' is defined but never used              no-unused-vars
   39:17  error  'destinations' is assigned a value but never used    no-unused-vars
   44:17  error  'activities' is assigned a value but never used      no-unused-vars
   49:17  error  'accommodations' is assigned a value but never used  no-unused-vars
  131:9   error  'handleEdit' is assigned a value but never used      no-unused-vars
  136:9   error  'handleDelete' is assigned a value but never used    no-unused-vars
  191:32  error  'trip' is defined but never used                     no-unused-vars
  227:25  error  'trip' is defined but never used                     no-unused-vars
  297:26  error  'id' is defined but never used                       no-unused-vars

/root/travel_app/server/auth.ts
    7:18  error  'UserType' is defined but never used           no-unused-vars
   14:13  error  'Express' is defined but never used            no-unused-vars
   16:15  error  'User' is defined but never used               no-unused-vars
  116:15  error  'password' is assigned a value but never used  no-unused-vars
  163:19  error  'password' is assigned a value but never used  no-unused-vars
  185:13  error  'password' is assigned a value but never used  no-unused-vars
  247:17  error  'password' is assigned a value but never used  no-unused-vars

/root/travel_app/server/index.ts
  48:97  error  '_next' is defined but never used  no-unused-vars

/root/travel_app/server/routes.ts
   20:14   error  'error' is defined but never used  no-unused-vars
   35:14   error  'error' is defined but never used  no-unused-vars
   83:14   error  'error' is defined but never used  no-unused-vars
  101:14   error  'error' is defined but never used  no-unused-vars
  116:14   error  'error' is defined but never used  no-unused-vars
  164:14   error  'error' is defined but never used  no-unused-vars
  182:14   error  'error' is defined but never used  no-unused-vars
  197:14   error  'error' is defined but never used  no-unused-vars
  245:14   error  'error' is defined but never used  no-unused-vars
  255:14   error  'error' is defined but never used  no-unused-vars
  270:14   error  'error' is defined but never used  no-unused-vars
  318:14   error  'error' is defined but never used  no-unused-vars
  329:14   error  'error' is defined but never used  no-unused-vars
  366:14   error  'error' is defined but never used  no-unused-vars
  376:14   error  'error' is defined but never used  no-unused-vars
  400:97   error  '_next' is defined but never used  no-unused-vars
  400:104  error  'NextFunction' is not defined      no-undef

/root/travel_app/server/storage.ts
  10:26  error  'sql' is defined but never used              no-unused-vars
  21:11  error  'id' is defined but never used               no-unused-vars
  22:21  error  'username' is defined but never used         no-unused-vars
  23:18  error  'email' is defined but never used            no-unused-vars
  24:14  error  'user' is defined but never used             no-unused-vars
  25:14  error  'id' is defined but never used               no-unused-vars
  25:26  error  'user' is defined but never used             no-unused-vars
  26:14  error  'id' is defined but never used               no-unused-vars
  30:18  error  'id' is defined but never used               no-unused-vars
  31:21  error  'destination' is defined but never used      no-unused-vars
  32:21  error  'id' is defined but never used               no-unused-vars
  32:33  error  'destination' is defined but never used      no-unused-vars
  33:21  error  'id' is defined but never used               no-unused-vars
  37:15  error  'id' is defined but never used               no-unused-vars
  38:30  error  'destinationId' is defined but never used    no-unused-vars
  39:18  error  'activity' is defined but never used         no-unused-vars
  40:18  error  'id' is defined but never used               no-unused-vars
  40:30  error  'activity' is defined but never used         no-unused-vars
  41:18  error  'id' is defined but never used               no-unused-vars
  45:20  error  'id' is defined but never used               no-unused-vars
  46:34  error  'destinationId' is defined but never used    no-unused-vars
  47:23  error  'accommodation' is defined but never used    no-unused-vars
  48:23  error  'id' is defined but never used               no-unused-vars
  48:35  error  'accommodation' is defined but never used    no-unused-vars
  49:23  error  'id' is defined but never used               no-unused-vars
  53:18  error  'userId' is defined but never used           no-unused-vars
  54:11  error  'id' is defined but never used               no-unused-vars
  55:14  error  'trip' is defined but never used             no-unused-vars
  56:14  error  'id' is defined but never used               no-unused-vars
  56:26  error  'trip' is defined but never used             no-unused-vars
  57:14  error  'id' is defined but never used               no-unused-vars
  60:23  error  'tripId' is defined but never used           no-unused-vars
  61:24  error  'tripDestination' is defined but never used  no-unused-vars
  62:29  error  'tripId' is defined but never used           no-unused-vars
  62:45  error  'destinationId' is defined but never used    no-unused-vars

/root/travel_app/shared/schema.ts
  1:48  error  'boolean' is defined but never used  no-unused-vars

✖ 172 problems (172 errors, 0 warnings)