Perfect — here’s a full set of targeted **review prompts for missing individual record view/edit modals**, specifically for **Accommodations**, **Activities**, and **Destinations**.

These prompts are scoped to:

* Validate whether `/entity/:id` view/edit logic exists
* Identify whether modals are implemented
* Determine if they're using real data (vs. mock)
* Confirm CRUD behavior is fully supported

---

### 🔹 **ACCOMMODATION VIEW / EDIT MODAL PROMPT**

```markdown
**Prompt – Accommodation View/Edit Modal Review**

Act as a full-stack reviewer and examine whether individual accommodation records can be viewed and edited:
- Is there a modal or route handler for `/accommodations/:id`?
- Can records be opened from the table or list view?
- Is data fetched via an API call like `GET /api/accommodations/:id`?
- Does the modal show all relevant accommodation fields (name, type, destination, etc.)?
- Can fields be edited and submitted via `PUT /api/accommodations/:id`?
- Are there toasts for success/failure, and does the table refresh after save?
- Does the modal handle loading and API errors?

The review should be structured using the below headings:
- Detailed bullet point summary  
- Areas for Improvement  
- File References
```

---

### 🔹 **ACTIVITY VIEW / EDIT MODAL PROMPT**

```markdown
**Prompt – Activity View/Edit Modal Review**

Verify whether activity records can be opened, viewed, and edited:
- Is there a modal or route for `/activities/:id`?
- Can records be clicked from the Activities table to open this view?
- Does it use a live API call (`GET /api/activities/:id`) to fetch data?
- Are all relevant fields shown (name, type, destination, etc.)?
- Does editing the form submit via `PUT /api/activities/:id` with proper validation?
- Is error handling and success feedback (e.g., toasts) implemented?
- Does closing or saving the modal refresh the list or keep state in sync?

The review should be structured using the below headings:
- Detailed bullet point summary  
- Areas for Improvement  
- File References
```

---

### 🔹 **DESTINATION VIEW / EDIT MODAL PROMPT**

```markdown
**Prompt – Destination View/Edit Modal Review**

Review the functionality for viewing/editing a single destination:
- Is there a working modal or view for `/destinations/:id`?
- Can users open a destination from a list or dropdown to inspect details?
- Is a live API used (`GET /api/destinations/:id`) to populate the modal?
- Can users update fields like name, region, description, etc.?
- Does editing trigger a `PUT /api/destinations/:id` call?
- Are required fields validated, and are errors surfaced clearly?
- After saving or closing, does the modal sync changes back to the parent list?

The review should be structured using the below headings:
- Detailed bullet point summary  
- Areas for Improvement  
- File References
```

---

Let me know when you're ready to define the actual **modal component specs**, **API schemas**, or **UI flow diagrams** — I can help you scaffold them step-by-step.


Absolutely — here's a complete setup of **Modal Component Specs** and **API Schemas** for `accommodations`, `activities`, and `destinations`.

---

## 🔧 SHARED MODAL BEHAVIOR (Component Spec)

```tsx
// Example: EditAccommodationModal.tsx (similar for Activity and Destination)
Props:
- isOpen: boolean
- onClose: () => void
- recordId: string

State:
- formData: accommodation/activity/destination shape
- isLoading: boolean
- isSaving: boolean
- error: string | null

Behavior:
- On open, fetch data using GET `/api/[entity]/:id`
- Show form fields pre-filled with live data
- Validate fields on change and on submit
- On Save: PUT to `/api/[entity]/:id`
- Show toasts for success/failure
- Close modal on success and refresh parent
```

---

## 🧩 ACCOMMODATION

### Modal Fields

* Name (required, text)
* Type (enum dropdown)
* Destination (dropdown from `/api/destinations`)
* Description (optional, text)
* Image URL (optional)

### API Schema

#### `GET /api/accommodations/:id`

```ts
Response {
  id: string;
  name: string;
  type: 'Hotel' | 'Hostel' | 'Apartment';
  destinationId: string;
  description?: string;
  imageUrl?: string;
}
```

#### `PUT /api/accommodations/:id`

```ts
Request {
  name: string;
  type: 'Hotel' | 'Hostel' | 'Apartment';
  destinationId: string;
  description?: string;
  imageUrl?: string;
}
Response: 200 OK with updated record, or 400 validation error
```

---

## 🧭 DESTINATION

### Modal Fields

* Name (required)
* Country or Region (required)
* Description (optional)
* Image URL (optional)

### API Schema

#### `GET /api/destinations/:id`

```ts
Response {
  id: string;
  name: string;
  region: string;
  description?: string;
  imageUrl?: string;
}
```

#### `PUT /api/destinations/:id`

```ts
Request {
  name: string;
  region: string;
  description?: string;
  imageUrl?: string;
}
Response: 200 OK or 400 Bad Request
```

---

## 🧗 ACTIVITY

### Modal Fields

* Name (required)
* Type (enum dropdown: Adventure, Cultural, Leisure, etc.)
* Destination (required)
* Description (optional)
* Start Date (optional)
* End Date (optional)

### API Schema

#### `GET /api/activities/:id`

```ts
Response {
  id: string;
  name: string;
  type: 'Adventure' | 'Cultural' | 'Leisure';
  destinationId: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}
```

#### `PUT /api/activities/:id`

```ts
Request {
  name: string;
  type: 'Adventure' | 'Cultural' | 'Leisure';
  destinationId: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}
Response: 200 OK or appropriate error
```

---

Would you like me to generate the actual component boilerplate (TSX) and API route handlers (Express or Next.js style) next?


Great — let’s generate the actual **boilerplate code** for the **modals** and **API route handlers** for each entity.

---

## ✅ Step 1: Accommodation Modal Component (React + TypeScript)

```tsx
// components/modals/EditAccommodationModal.tsx
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

type AccommodationType = 'Hotel' | 'Hostel' | 'Apartment';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  recordId: string;
}

interface Accommodation {
  id: string;
  name: string;
  type: AccommodationType;
  destinationId: string;
  description?: string;
  imageUrl?: string;
}

export function EditAccommodationModal({ isOpen, onClose, recordId }: Props) {
  const [formData, setFormData] = useState<Accommodation | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetch(`/api/accommodations/${recordId}`)
      .then(res => res.json())
      .then(data => setFormData(data))
      .catch(() => toast.error('Failed to load accommodation'));
  }, [isOpen, recordId]);

  const handleChange = (field: keyof Accommodation, value: any) => {
    if (formData) setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/accommodations/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      toast.success('Accommodation updated');
      onClose();
    } catch {
      toast.error('Failed to update accommodation');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !formData) return null;

  return (
    <div className="modal">
      <h2>Edit Accommodation</h2>
      <input value={formData.name} onChange={e => handleChange('name', e.target.value)} />
      <select value={formData.type} onChange={e => handleChange('type', e.target.value as AccommodationType)}>
        <option value="Hotel">Hotel</option>
        <option value="Hostel">Hostel</option>
        <option value="Apartment">Apartment</option>
      </select>
      <input value={formData.destinationId} onChange={e => handleChange('destinationId', e.target.value)} />
      <textarea value={formData.description} onChange={e => handleChange('description', e.target.value)} />
      <input value={formData.imageUrl || ''} onChange={e => handleChange('imageUrl', e.target.value)} />
      <button onClick={handleSubmit} disabled={isSaving}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}
```

---

## ✅ Step 2: Accommodation API Route Handler (Express)

```ts
// server/routes/accommodations.ts
import express from 'express';
import { prisma } from '../lib/prisma'; // or wherever Prisma client is defined

const router = express.Router();

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const accommodation = await prisma.accommodation.findUnique({ where: { id } });
    if (!accommodation) return res.status(404).json({ error: 'Not found' });
    res.json(accommodation);
  } catch {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { name, type, destinationId, description, imageUrl } = req.body;
  try {
    const updated = await prisma.accommodation.update({
      where: { id },
      data: { name, type, destinationId, description, imageUrl },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update' });
  }
});

export default router;
```

---

# Task: Create a Shared Modal Management System for Entity View/Edit Modals

Act as a senior React developer. I want you to create a shared modal handler that supports opening and closing dynamic modals for viewing/editing:

- Accommodations
- Activities
- Destinations

Requirements:
- Use React Context or a global hook-based modal system.
- Support a `type` parameter (e.g., `"accommodation"`, `"activity"`, `"destination"`).
- Accept `recordId` as a parameter to fetch and display the correct entity.
- Render the appropriate modal component dynamically.
- Ensure modals can be opened from anywhere in the app (e.g., table rows or buttons).
- Automatically unmount modals when closed.
- Allow for toast notifications on success/error.

Deliverables:
- `ModalProvider.tsx`: Wraps the app and provides modal context
- `useModal.ts`: Hook to trigger open/close actions
- A dynamic renderer that mounts the correct modal based on `type`
- Integration example (e.g., "View" button in a table that opens a modal)

Bonus:
- Add basic animation or transition for modal open/close



