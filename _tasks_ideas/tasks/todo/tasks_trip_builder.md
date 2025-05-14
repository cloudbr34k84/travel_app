Perfect! Below are the prompts for **Trips** and **Trip Builder**, each with your requested review structure.

---

### 🔹 **TRIPS PAGE PROMPTS**

```markdown
**Prompt 1 – Add Trip Button Integration Review**

Review the “Add Trip” button on the Trips page:
- Is it calling the actual trip-creation API (not mock)?
- Are the payloads formatted to match the backend schema?
- Does it show loading state or disable during API call?
- Are toasts shown for success and error (e.g. duplicate destination)?
- Are all API/network errors handled gracefully?

The review should be structured using the below headings:
- Detailed bullet point summary  
- Areas for Improvement  
- File References
```

---

```markdown
**Prompt 2 – Add Trip Modal Fields & Validation**

Check the Add Trip modal for:
- Required fields:
  - Trip Name (required)
  - Start Date and End Date (required, proper date validation)
  - Destination (dropdown from API)
- Form validation present for all required fields
- Inline errors shown for invalid or empty input
- Submit button disabled until form is valid
- Proper mapping of server-side errors back to UI

The review should be structured using the below headings:
- Detailed bullet point summary  
- Areas for Improvement  
- File References
```

---

```markdown
**Prompt 3 – Destination Dropdown Functionality in Add Trip**

Review how the Destination dropdown is implemented in the Add Trip modal:
- Uses live data from the destination API
- Shared dropdown logic with other modules (e.g. activities, accommodations)
- If no destinations exist:
  - Displays fallback UI (e.g. “No destinations available—add one”)
  - Clicking the fallback opens Add Destination modal
- Handles loading and error states

The review should be structured using the below headings:
- Detailed bullet point summary  
- Areas for Improvement  
- File References
```

---

```markdown
**Prompt 4 – Trip Filters and Search**

Inspect the filter bar and search functionality:
- Filters for destination, date range, or status use live data/enums
- Search box triggers live API search with debounce
- Results rendered from API responses (not mock)
- Proper handling for empty state (“No trips found”)
- Filter resets and combined filtering work correctly

The review should be structured using the below headings:
- Detailed bullet point summary  
- Areas for Improvement  
- File References
```

---

### 🔹 **TRIP BUILDER PAGE PROMPTS**

```markdown
**Prompt 5 – Trip Builder Data Source and Initialization**

On the Trip Builder page:
- Is the trip being fetched via a live API call using the trip ID?
- Are activities and accommodations fetched using associated destination/trip ID?
- Is all data properly hydrated before rendering sections?
- Are loading and error states implemented for all sections (trip details, activities, accommodations)?

The review should be structured using the below headings:
- Detailed bullet point summary  
- Areas for Improvement  
- File References
```

---

```markdown
**Prompt 6 – Add/Remove Activities and Accommodations**

Check interactive elements in Trip Builder:
- “Add Activity” and “Add Accommodation” buttons open modal with valid trip/destination context
- Selected activities/accommodations are correctly persisted via API
- Removing an item triggers a delete call to the API
- The UI updates reflect API results (e.g., optimistic update, re-fetch on success)
- Toasts for both success and failure

The review should be structured using the below headings:
- Detailed bullet point summary  
- Areas for Improvement  
- File References
```

---

```markdown
**Prompt 7 – Date Handling & Schedule Logic**

Evaluate how dates are managed in Trip Builder:
- Do activities and accommodations have start/end dates?
- Are date pickers validated to be within the trip's start/end range?
- Does the UI prevent overlapping bookings or invalid sequences?
- Any logic errors if an item is added on an unavailable day?

The review should be structured using the below headings:
- Detailed bullet point summary  
- Areas for Improvement  
- File References
```

---

Let me know if you'd like the same breakdown for **User Profile**, **Login/Registration**, or **Settings** next.
