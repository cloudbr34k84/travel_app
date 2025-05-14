## Prompt 1 – Add Activity Button Integration Review
### Instructions
Act as a full-stack reviewer. On the Activities page, inspect the “Add Activity” button and answer:
- Is its click handler calling the real activity-creation API (not mock)?  
- Are request payloads correctly built (e.g. JSON keys match backend)?  
- Does it disable itself or show loading while the network request is in flight?  
- Does it show a success toast on 2xx and an error toast on non-2xx?  
- Are network errors (e.g. timeout, 500) caught and surfaced as toasts?  
### Review Reply
#### Detailed Bullet Point Summary
- **API Call Integration**  
  - The “Add Activity” button correctly calls the real activity-creation API via the `createActivity` mutation.  
  - Uses `apiRequestWithJson` to POST to `/api/activities` with typed parameters.  
- **Request Payload Structure**  
  - Payload matches backend expectations and uses the `InsertActivity` type from the shared schema.  
  - Form values are converted in `handleCreateOrUpdateActivity`.  
- **Loading State**  
  - Button does **not** disable or show a loading indicator during submission.  
  - The form lacks any loading state.  
- **Toast Notifications**  
  - **Success:** `onSuccess` shows a “Success” toast for 2xx responses.  
  - **Error:** `onError` shows an “Error” toast for non-2xx responses using the `useToast` hook.  
- **Error Handling**  
  - Network errors are caught in `onError` and surfaced as toasts.  
  - No differentiation between timeout vs. server error.  
#### Areas for Improvement
- **Loading State:** Disable the button or show a spinner during submission.  
- **Enhanced Error Handling:** Differentiate error types (timeout, validation, etc.) and show descriptive messages.  
- **Form Validation Feedback:** Provide real-time feedback on input validity.  
- **Dialog Behavior:** Keep the modal open on error to allow corrections without retyping.  
#### File References
- `client/src/pages/activities.tsx` – Main page component with the “Add Activity” button and mutation logic  
- `client/src/components/forms/activity-form.tsx` – Form component with validation and submission handling  
- `client/src/hooks/use-toast.ts` – Toast notification mechanism for success/error feedback  

---

## Prompt 2 – Add Activity Modal Fields & Validation
### Instructions
Review the Add Activity modal and verify:
- It contains the following fields with correct types:  
  - **Activity Name** (required text)  
  - **Type** (required enum dropdown)  
  - **Destination** (dropdown populated via live API)  
- All required fields enforce client-side validation before submit.  
- Validation errors display inline beneath the field.  
- The **Submit** button is disabled until the form is valid.  
- On submit, invalid server responses (e.g. 400 with field errors) map back to correct field errors/toasts.  
### Review Reply
#### Detailed Bullet Point Summary
- **Fields and Types**  
  - **Activity Name:** Required text input using `FormField`.  
  - **Category (Type):** Required dropdown via `Select` component (note: labeled “Category” in code).  
  - **Destination:** Dropdown populated from `/api/destinations` via React Query.  
  - **Image URL:** Optional text input with URL validation.  
- **Client-side Validation**  
  - Uses Zod schema (`activityFormSchema`) extending `insertActivitySchema`.  
  - Enforced by `useForm` with `zodResolver`.  
- **Validation Error Display**  
  - Inline errors shown via `FormMessage` within each `FormItem`.  
- **Submit Button Behavior**  
  - Button is **not** disabled based on form validity.  
- **Server Response Handling**  
  - Errors show general toasts via `useToast`; not mapped to specific fields.  
- **API Integration**  
  - Converts form values and passes defaults in edit mode.  
#### Areas for Improvement
- **Disable Submit Button:** Until form is valid and during submission.  
- **Field-Level Error Mapping:** Map server validation errors back to specific fields.  
- **Loading Indicators:** Show spinner on submit.  
- **Terminology Consistency:** Use “Type” vs. “Category” uniformly.  
- **Form Reset & Preview:** Reset form after success; preview image URL input.  
- **Error Specificity:** Distinguish network vs. validation errors.  
#### File References
- `client/src/components/forms/activity-form.tsx` – Form implementation and validation  
- `shared/schema.ts` – `insertActivitySchema` and related type definitions  
- `client/src/pages/activities.tsx` – Modal usage and `onSubmit` handling  

---

## Prompt 3 – Destination Dropdown Population & Fallback
### Instructions
Examine the “Destination” dropdown both in the modal and on the main filter bar:
- Fetches live list via API each time?  
- Uses the same endpoint in both places?  
- Placeholder text if list is empty (“No destinations—add one”)?  
- Clicking placeholder opens the Add Destination modal?  
- Loading state (spinner/“Loading…”) while fetching?  
### Review Reply
#### Detailed Bullet Point Summary
- **API Fetching Mechanism**  
  - Both `destination-form.tsx` and `trip-builder.tsx` fetch from `/api/destinations` via React Query.  
  - React Query caching avoids refetch on each mount until stale.  
- **Empty State Handling**  
  - **Destination Form:** No empty-state UI when no destinations exist.  
  - **Trip Builder:** Shows “No destinations selected,” but not “No destinations available.”  
  - **Filter Bar:** Defaults to “All Regions” with no empty-state messaging.  
- **Loading State Visualization**  
  - Components use `isLoading` but do not render any spinner or text.  
  - No skeletons or placeholders during fetch.  
- **User Experience Issues**  
  - No call-to-action for empty lists.  
  - Lack of feedback during loading.  
#### Areas for Improvement
- **Loading Indicators:** Show spinner or “Loading…” using `isLoading`.  
- **Empty-State Messaging:** “No destinations – add one” with a button opening the modal.  
- **Error Handling:** Display errors and retry option on fetch failure.  
- **Reusable Component:** Encapsulate dropdown logic (loading, empty, error) into a shared component.  
- **Prefetching & Cache:** Use React Query prefetching and stale-while-revalidate to improve UX.  
#### File References
- `client/src/pages/destinations.tsx` – Main filter bar implementation  
- `client/src/components/forms/destination-form.tsx` – Modal dropdown  
- `client/src/pages/trip-builder.tsx` – Trip builder page  
- `client/src/components/ui/select.tsx` – Base Select component  

---

## Prompt 4 – Main-Page Filter Dropdowns
### Instructions
On the Activities page’s filter bar, confirm:
- “All Types” dropdown reads options from backend enum API (not hard-coded).  
- “All Destinations” dropdown uses same live list as modal.  
- Selecting a filter triggers API re-query of activity data.  
- UI resets correctly when “All” is chosen.  
- Invalid enum values from API handled gracefully.  
### Review Reply
#### Detailed Bullet Point Summary
- **“All Categories” Dropdown**  
  - Hard-coded in `activities.tsx` and duplicated in `activity-form.tsx`.  
- **“All Destinations” Dropdown**  
  - Dynamically fetched from `/api/destinations`.  
- **Filter Behavior**  
  - Client-side filtering only; no API parameters used.  
- **UI Reset**  
  - Resets correctly when “all” selected via filter conditions.  
- **Invalid Enum Handling**  
  - No validation; invalid values pass through without error.  
#### Areas for Improvement
- **Backend-Driven Categories:** Fetch category list from API.  
- **Server-Side Filtering:** Pass filter params to endpoint for large datasets.  
- **Loading States:** Show spinner or skeleton during fetch.  
- **Error Handling:** Display friendly errors and retry on failure.  
- **URL Sync:** Store filters in URL for shareable views.  
- **Reset Button:** Add a “Reset Filters” control.  
#### File References
- `client/src/pages/activities.tsx` – Filter bar implementation  
- `client/src/components/forms/activity-form.tsx` – Hard-coded category list  
- `client/src/components/ui/search-filter.tsx` – Search/filter UI component  
- `server/routes.ts` – API routes for activities and destinations  
- `shared/schema.ts` – Enum definitions and schemas  

---

## Prompt 5 – Search Box & Table Data
### Instructions
Audit the search and table integration:
- Does typing in the search box debounce input and call the search API?  
- Are results rendered from API response (not mock fixtures)?  
- Is empty-state handling in place (“No activities found”)?  
- Are pagination or infinite-scroll states linked to API cursors/params?  
- Are error toasts shown if the search request fails?  
### Review Reply
#### Detailed Bullet Point Summary
- **Search Implementation**  
  - Client-side only, no debouncing; filters on every keystroke.  
  - Uses `setSearch` to update state on each input.  
- **Data Source**  
  - Fetched via React Query from `/api/activities`.  
  - Does not trigger new API calls on search.  
- **Empty-State Handling**  
  - Shows “No activities found” with “Add Your First Activity” button.  
- **Loading States**  
  - Renders skeleton UI while `isLoading` is true.  
- **Pagination/Infinite Scroll**  
  - No pagination or infinite scroll; all data loads at once.  
- **Error Handling**  
  - Mutations show error toasts; initial query lacks specific error UI.  
#### Areas for Improvement
- **Debounce Search:** Use debounce utility or custom hook.  
- **Server-Side Search:** Pass search terms to API endpoint and filter there.  
- **Pagination/Infinite Scroll:** Implement for large datasets.  
- **Error UI for Fetch:** Add error state and retry for initial query.  
- **Fuzzy Search & Sorting:** Improve relevance ranking and fuzzy matching.  
#### File References
- `client/src/pages/activities.tsx` – Search/filter logic  
- `client/src/components/ui/search-filter.tsx` – Search component  
- `client/src/components/activities/activity-card.tsx` – Activity card display  
- `server/routes.ts` – Backend activity endpoints  
- `client/src/hooks/use-toast.ts` – Error notification hook  
