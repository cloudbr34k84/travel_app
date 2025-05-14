Perfect — with those two wireframes, we now have everything we need to define the complete Trip Builder refactor. Here's the plan based on your vision:

---

## ✅ Phase 1: Trip Builder Refactor Plan

### 🔁 Replace `/trips/[id]` With Unified View/Edit

| Mode          | Behavior                                                                 |
| ------------- | ------------------------------------------------------------------------ |
| **View Mode** | Shows static trip info, destinations, activities, and accommodations     |
| **Edit Mode** | Allows inline editing of all fields and sections (as shown in wireframe) |

### 🧩 Structure Overview

**URL**: `/trips/[id]`
**Entry Point**: Always starts in **View Mode**
**Toggle**: "Edit" button toggles to **Edit Mode**
**Auto-save**: Edits are saved in-memory and persisted with debounce (`500ms` after last change)

---

## 🧱 Trip Builder UI Breakdown (based on wireframes)

### 🧭 Header Area

* Breadcrumb: `Dashboard > Trips > View Trip`
* Top-right actions:

  * **Edit** button (toggles into Edit Mode)
  * **Delete** button (confirms and removes trip)

---

### 📋 View Mode Wireframe (Screenshot 2)

* **Top Summary Cards**:

  * Trip Duration, Destination Count, Activities Count, Accommodations Count
* **Trip Details**:

  * Name, Dates, Status, Priority (all readonly)
* **Destinations Section**:

  * Grouped by destination name and dates
  * Nested lists:

    * Selected Activities (comma-separated)
    * Accommodations (simple list)

---

### ✍️ Edit Mode Wireframe (Screenshot 1)

* **Trip Details Input**:

  * Name, Start Date, End Date, Status (dropdown), Priority (dropdown)
* **Add Destination**:

  * Select destination + date range
* **Destination Cards** (e.g., "Paris, France"):

  * Tabs for "Activities" and "Accommodations"
  * Selected items shown as tags with remove buttons
  * Searchable right-side lists to add more

---

### ✨ Additional Features

* 🧠 **Auto-save logic** with optimistic UI:

  * `setTimeout` debounce (500ms)
  * POST or PATCH on dirty state
* 💬 **Confirm Discard Dialog** when navigating away mid-edit
* 🪄 **Post-Creation Prompt**:
  After user creates a trip:

  ```
  ✅ Trip Created!
  [ View Trip ] [ Stay on Trips Page ]
  ```

---

### 🧹 Sidebar Cleanup

* ✅ Remove `Trip Builder` sidebar item

---

Would you like the **Replit Prompt** to implement this full refactor now?
Or do you want a breakdown of **backend routes/schema** changes first?
