## Prompt 1 – Add Accommodation Button Integration Review
### Instructions
Act as a full-stack reviewer. On the Accommodation page, inspect the “Add Accommodation” button and answer:
1. Is its click handler calling the real accommodation-creation API (not mock)?  
2. Are request payloads correctly built (e.g. JSON keys match backend)?  
3. Does it disable itself or show loading while the network request is in flight?  
4. Does it show a success toast on 2xx and an error toast on non-2xx?  
5. Are network errors (e.g. timeout, 500) caught and surfaced as toasts?  
### Reply Review
1. **Click Handler**  
   The click handler is calling the real API. It uses TanStack Query’s `useMutation` hook with `apiRequestWithJson` to POST to `/api/accommodations`, matching the server route that calls `storage.createAccommodation(accommodationData)`.
2. **Payload Construction**  
   Request payloads are correctly built. The form uses React Hook Form and Zod validation (via `insertAccommodationSchema` from `@shared/schema`), ensuring frontend and backend schemas stay in sync.
3. **Loading State**  
   The button does **not** disable or display a loading indicator during the mutation.  
   *Improvement:* Disable the button or show a spinner while the request is pending to prevent duplicate submissions.
4. **Toast Notifications**  
   - **On success (2xx):** Shows a toast with title “Success” and description “Accommodation created successfully.”  
   - **On error (non-2xx):** Shows a toast with title “Error,” description “Failed to create accommodation,” and variant “destructive.”
5. **Network Error Handling**  
   Network errors (timeouts, 500s, etc.) are caught by the mutation’s `onError` callback and surfaced as error toasts. The underlying `apiRequestWithJson` throws on failed fetches, which `onError` then handles.
#### Areas for Improvement
- **Loading State:** Add a loading indicator or disable the button during submission.  
- **Specific Error Messages:** Surface more detailed error info rather than a generic message.  
- **Real-Time Validation Feedback:** Consider live form validation feedback as the user types.
Here's a complete markdown prompt for each of the improvement areas from the review, following Prompting 101 and including the instruction to add clear JSDoc to support future AI review:


---

Prompt 1 – Add Loading State to Add Accommodation Button

**Task**: Improve UX of the "Add Accommodation" button by adding a loading state during form submission.

**Context**:  
Currently, the "Add Accommodation" button remains clickable during API submission, which may lead to accidental duplicate requests.

**Instructions**:  
1. Update the component file (likely `accommodations.tsx` or `AccommodationForm.tsx`) to:
   - Disable the button and/or show a spinner while the API request is in progress.
   - Use React state or `isLoading` from `useMutation` to manage the button state.

2. Update JSDoc at the top of the file and near the `Add Accommodation` button logic:
   - Explain the button's purpose and when it should be disabled.
   - Include guidance for maintaining consistency across other API-driven buttons.

**Example**:
```tsx
// Disable button with loading state
<button type="submit" disabled={isLoading}>
  {isLoading ? 'Saving...' : 'Add Accommodation'}
</button>

Deliverables:

Updated component with loading state logic.

JSDoc explaining button behavior and loading handling best practices.


---

### **Prompt 2 – Improve Error Messages for Accommodation Creation**

```md
**Task**: Replace generic error toasts with specific error messages from API responses when accommodation creation fails.

**Context**:  
Currently, the error toast shows "Failed to create accommodation" regardless of the actual failure reason. Improving this will enhance UX and debugging.

**Instructions**:  
1. Update the `onError` logic in the `useMutation` block to:
   - Inspect the `error` object or response body.
   - Show a detailed message if available (e.g. validation failed, name required, server timeout, etc.).

2. Update JSDoc in the component file:
   - Document how the error handling logic works.
   - Include instructions for maintaining informative error messages across similar forms.

**Example**:
```tsx
onError: (error) => {
  const message = error?.response?.data?.message || 'Failed to create accommodation';
  toast.error(message);
}

Deliverables:

Updated error handling logic.

JSDoc that documents custom error toast behavior and best practices.


---

### **Prompt 3 – Add Real-Time Validation Feedback to Form Fields**

```md
**Task**: Enhance the accommodation form with real-time validation feedback using React Hook Form and Zod.

**Context**:  
Users currently receive validation errors only on submit. Inline, real-time validation will improve usability and prevent submit-time frustration.

**Instructions**:  
1. Refactor the form to display validation messages as users type.
   - Use `formState.errors` and `onChange`/`onBlur` from React Hook Form.
   - Show messages under relevant fields (e.g., "Name is required").

2. Update JSDoc in the form component file:
   - Document which fields use real-time validation and why.
   - Include a general guide for developers to replicate this in other forms.

**Example**:
```tsx
{errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

Deliverables:

Real-time validation logic for all critical fields.

JSDoc covering form validation philosophy and usage patterns.


---

Let me know when you’re ready for me to help generate these directly into the appropriate files or if you’d like to chain these into a single multi-step refactor prompt.


---

## Prompt 2 – Add Accommodation Modal Fields & Validation
### Instructions
Review the Add Accommodation modal and verify:
- It contains the following fields with correct types:  
  - **Accommodation Name** (required text)  
  - **Type** (required enum dropdown)  
  - **Destination** (dropdown populated via live API)  
- All required fields enforce client-side validation before submit.  
- Validation errors display inline beneath the field.  
- The **Submit** button is disabled until the form is valid.  
- On submit, invalid server responses (e.g. 400 with field errors) map back to the correct field errors/toasts.  
### Reply Review
#### Modal Fields Check
- Accommodation Name (text field, required): Present and required  
- Type (enum dropdown, required): Present with predefined accommodation types  
- Destination (dropdown populated via API): Present and populated from `/api/destinations` via React Query  

#### Validation Features
- Client-side validation: Uses Zod schema via `zodResolver`  
- Inline error display: Uses `FormMessage` components beneath each field  
- Submit button disabled until form is valid: **Not implemented**  
- Server error mapping to fields: Only a generic error toast is shown; no field-specific mapping  
#### Improvements Needed
- Disable the submit button until the form is valid (and while submitting).  
- Map server-side validation errors back to the corresponding form fields.  
#### File References
- **`client/src/components/forms/accommodation-form.tsx`**  
  - Add form state logic to disable the button based on validity/submission.  
  - Enhance error handling to parse and display field errors.  
- **`client/src/pages/accommodations.tsx`**  
  - Improve server-error handling by routing field errors back to form inputs
  - 
---

## Prompt 3 – Destination Dropdown Population & Fallback
### Instructions
Examine the “Destination” dropdown both in the modal and on the main filter bar:
- Does it fetch the live list of destinations via API each time?  
- Are the options driven by the same endpoint in both places?  
- If the dropdown list is empty, is there placeholder text like “No destinations—add one”?  
- Does clicking that placeholder open the Add Destination modal?  
- Is there a loading state (spinner/“Loading…”) while fetching?  

### Reply Review
#### Detailed Bullet Point Summary
- **Dropdown Population Mechanism**  
  - API Source: Both dropdowns (`destination-form.tsx` and `trip-builder.tsx`) fetch from `/api/destinations` via React Query.  
  - Caching: React Query’s cache ensures subsequent mounts reuse data.  
  - Consistency: Both dropdowns use the same data source.
- **Empty State Handling**  
  - Filter Bar: No dedicated empty-state UI when the list is empty.  
  - Destination Form: No UI for empty list.  
  - Trip Builder: Shows “No destinations selected” but not “No destinations available.”
- **Loading States**  
  - No visible loading indicators during fetch.  
  - Components use `isLoading`, but do not render a spinner or text.  
  - Users lack feedback while data loads.
#### File References
- `client/src/components/forms/destination-form.tsx`  
- `client/src/pages/trip-builder.tsx`  
- `client/src/components/forms/activity-form.tsx`  
- `client/src/components/ui/select.tsx`  
#### Areas for Improvement
- **Empty-State Messaging:**  
  - Show “No destinations found—add one” with a button to open the modal.  
- **Loading Indicators:**  
  - Render a spinner or “Loading…” text using React Query’s `isLoading`.  
  - Consider skeleton UIs for better UX.  
- **Error Handling:**  
  - Display retryable error messages on fetch failures.  
- **Reusable Component:**  
  - Encapsulate dropdown logic (loading, empty, error) into one reusable `DestinationDropdown` component.  

---

## Prompt 4 – Main-Page Filter Dropdowns
### Instructions
On the Accommodation page’s filter bar, confirm:
- “All Types” dropdown reads options from the backend enum API (not hard-coded).  
- “All Destinations” dropdown uses the same live list as the modal.  
- Selecting a filter triggers the API to re-query accommodation data.  
- The UI resets correctly when “All” is chosen.  
- Invalid enum values from the API are handled gracefully.  

### Reply Review
#### Detailed Analysis of Accommodation Page Filter Dropdowns
- **“All Types” Dropdown**  
  - Currently hard-coded in `accommodations.tsx`:  
    ```ts
    const typeOptions: FilterOption[] = [
      { value: "all", label: "All Types" },
      { value: "Hotel", label: "Hotel" },
      // …other types
    ];
    ```
- **“All Destinations” Dropdown**  
  - Dynamically generated from React Query’s `/api/destinations` data.  
- **Filtering Implementation**  
  - Client-side only; does not send query parameters back to the API.  
- **UI Reset Behavior**  
  - Checks for `"all"` value to reset filters correctly.  
- **Invalid Enum Handling**  
  - No validation against backend enum; invalid types pass through without error.

#### Bullet Point Summary
- ❌ **All Types** uses hard-coded values.  
- ✅ **All Destinations** is dynamic and matches modal.  
- ❌ Filtering is client-side only.  
- ✅ UI resets correctly with “All.”  
- ❌ No handling for invalid enum values.

#### Areas for Improvement
- Fetch accommodation types from the backend enum API.  
- Implement server-side filtering via query parameters.  
- Validate and handle unexpected enum values.  
- Add filter state to URL for shareable views.  
- Provide a “Reset Filters” button.  

---

## Prompt 5 – Search Box & Table Data
### Instructions
Audit the search and table integration:
- Does typing in the search box debounce user input and call the search API endpoint?  
- Are search results rendered from the API response (not mock fixtures)?  
- Is empty-state handling in place (“No accommodations found”)?  
- Are pagination or infinite-scroll states correctly linked to API cursors/params?  
- Are error toasts shown if the search request fails?  
### Reply Review
#### Detailed Bullet Point Summary
- ❌ **No Debouncing:** Search input filters on every keystroke without delay.  
- ❌ **Client-Side Filtering:** Search is applied to already-fetched data, not via API.  
- ✅ **Real Data Source:** Accommodations come from a real `/api/accommodations` call.  
- ✅ **Empty-State Handling:** Shows “No accommodations found” with an action button.  
- ❌ **No Pagination:** Entire dataset fetched at once; no paging or infinite scroll.  
- ❌ **Limited Error Handling:** No specific error toasts for search/filter failures.  
- ✅ **Loading States:** Displays skeleton UI while fetching data.  
- ✅ **Filter Reset:** “All” options reset filters as expected.
#### File References
- `client/src/pages/accommodations.tsx`  
- `client/src/components/ui/search-filter.tsx`  
- `client/src/components/accommodations/accommodation-card.tsx`  
#### Areas for Improvement
- **Debounce Input:** Implement debounce in `accommodations.tsx` for the search box.  
- **Server-Side Search:** Send search queries as parameters to the API endpoint.  
- **Pagination/Infinite Scroll:** Load data in pages or use cursor-based fetching.  
- **Error Toasts:** Catch and display toasts for failed search requests.  
- **Reset Filters Button:** Add a dedicated reset control in the search-filter component.  
