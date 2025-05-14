Great — based on the profile UI you've provided, here’s a structured set of **review prompts for the Profile page**, formatted to match your preferred breakdown.

---

### 🔹 **PROFILE PAGE PROMPTS**

```markdown
**Prompt 1 – Profile Data Source & Display Review**

Evaluate the Profile page’s displayed data:
- Is all data (name, email, bio, joined date, last login, login count) pulled from the real user API?
- Is the avatar properly generated (e.g., initials fallback)?
- Are “Not specified” fields dynamically detected or hardcoded?
- Is the login count updated based on actual login events?

The review should be structured using the below headings:
- Detailed bullet point summary  
- Areas for Improvement  
- File References
```

---

```markdown
**Prompt 2 – Edit Profile Modal & Validation**

When the user clicks "Edit Profile":
- Does it open a modal or navigate to a form pre-filled with the current user data?
- Are all editable fields present (name, phone, location, bio)?
- Are form fields validated (e.g., required fields, valid formats)?
- Are changes submitted to the live `/api/user` or equivalent endpoint?
- Do toasts appear for success/failure? Does the UI re-render on success?

The review should be structured using the below headings:
- Detailed bullet point summary  
- Areas for Improvement  
- File References
```

---

```markdown
**Prompt 3 – Password Change (Security Tab) Flow**

Audit the **Security** tab with the change password form:
- Are all fields required: Current Password, New Password, Confirm New Password?
- Does New Password enforce rules (min 8 chars, upper/lower/number)?
- Is real-time validation shown for password mismatch or invalid length?
- Is the request sent to a secure `/api/user/change-password` or equivalent?
- Are error messages shown for wrong current password or backend issues?
- Does the form lock during submission and show toasts on completion?

The review should be structured using the below headings:
- Detailed bullet point summary  
- Areas for Improvement  
- File References
```

---

```markdown
**Prompt 4 – Tab Navigation State**

Evaluate tab handling between “About” and “Security”:
- Does the tab switch update local component state or URL fragment?
- Does switching tab preserve form data if user switches back?
- Is focus accessible/tab-index managed for accessibility?
- Can the tabs be deep-linked (e.g., `?tab=security`)?

The review should be structured using the below headings:
- Detailed bullet point summary  
- Areas for Improvement  
- File References
```

---

Let me know once you’ve finished reviewing Profile — and feel free to send over the **Settings** screenshots when ready.
