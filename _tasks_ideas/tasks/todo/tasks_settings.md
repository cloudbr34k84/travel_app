Excellent. Based on your screenshots and the known fact that these **Settings features are not yet implemented in the schema or API**, the prompts below are designed to help an AI agent conduct a **completeness and wiring audit**, including schema cross-checks, form bindings, and API integration.

---

### 🔹 **SETTINGS PAGE PROMPTS**

```markdown
**Prompt 1 – Appearance Settings Integration Review**

Review the **Appearance** tab and confirm:
- Is the selected theme (light/dark) value persisted in any user preference API or database schema?
- Are Language and Time Format dropdowns wired to any live API or schema-stored values?
- Does clicking "Save Changes":
  - Trigger an actual POST/PUT API call?
  - Update user preferences in the backend or just local state?
- Are changes reflected immediately in UI (e.g., theme switch, language formatting)?
- Does any validation or error handling exist?

The review should be structured using the below headings:
- Detailed bullet point summary  
- Areas for Improvement  
- File References
```

---

```markdown
**Prompt 2 – Notification Preferences Integration Review**

Review the **Notifications** tab:
- Are toggles for Email, Push, Trip Reminders, and Marketing Emails:
  - Connected to backend user preferences schema?
  - Bound to real-time user data (e.g., loaded from and saved to API)?
- Is there a schema (or proposed schema) that supports these booleans?
- Does “Save Changes” trigger a PATCH or PUT call to persist changes?
- Are updates optimistic, and is feedback (success/error toast) implemented?

The review should be structured using the below headings:
- Detailed bullet point summary  
- Areas for Improvement  
- File References
```

---

```markdown
**Prompt 3 – Privacy Settings Integration Review**

Audit the **Privacy** tab:
- Do settings like “Show Profile”, “Share Trips”, and “Allow Friend Requests” exist in the user schema or backend yet?
- Are the current toggle states pulled from live user settings or just default UI?
- Is there validation logic or policy enforcement based on these settings (e.g., trip visibility checks)?
- Does clicking “Save Changes”:
  - Send data to an endpoint (e.g., `/api/user/privacy`)?
  - Return errors or confirm success?

The review should be structured using the below headings:
- Detailed bullet point summary  
- Areas for Improvement  
- File References
```

---

```markdown
**Prompt 4 – Security Settings Integration Review**

Inspect the **Security** tab for:
- Change password flow:
  - Is the form wired to a `/api/user/change-password` endpoint?
  - Are validation rules enforced (e.g., password strength, mismatch)?
  - Do success and error messages work properly?
- Two-Factor Authentication and Login Alerts:
  - Are these supported in the user schema at all?
  - Are any toggles connected to backend logic?
  - Are UI components disabled or misleading if not implemented?

The review should be structured using the below headings:
- Detailed bullet point summary  
- Areas for Improvement  
- File References
```

---

```markdown
**Prompt 5 – Settings Tabs & State Handling**

Evaluate the overall **Settings tab** navigation and form behavior:
- Are tabs tied to URL fragments or component-level state?
- Are unsaved changes preserved when switching tabs?
- Are forms cleared/reset properly after submission?
- Are each tab’s inputs conditionally rendered or always mounted?
- Are all tabs wrapped in a consistent layout component?

The review should be structured using the below headings:
- Detailed bullet point summary  
- Areas for Improvement  
- File References
```

---

Let me know when you're ready to move on to the **dashboard**, **friend system**, or any other page/component!
