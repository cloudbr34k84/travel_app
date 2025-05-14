Thanks! Based on your **Dashboard screenshot**, here are the review prompts to help an AI agent determine if real data is being used (versus static/mock values), and whether the dashboard logic is fully implemented.

---

### 🔹 **DASHBOARD PAGE PROMPTS**

```markdown
**Prompt 1 – Dashboard Summary Cards Integration Review**

Audit the four dashboard summary cards:
- Are the counts (Upcoming Trips, Destinations, Activities, Accommodations) queried from the live database or are they hardcoded?
- Are these numbers coming from centralized API endpoints (e.g., `/api/stats`, `/api/trips/upcoming`)?
- Is the definition of “Upcoming” (e.g., start date > today) implemented on the server or frontend?
- Are loading states or error states handled gracefully?

The review should be structured using the below headings:
- Detailed bullet point summary  
- Areas for Improvement  
- File References
```

---

```markdown
**Prompt 2 – Next Trip Section Review**

Evaluate the **Next Trip** panel:
- Is it dynamically selecting the trip with the nearest future start date?
- Is the trip card data (name, destination, dates, days remaining, activity/accommodation count) pulled via API?
- Is the trip image real (e.g., stored in DB or generated via logic) or hardcoded?
- Does “View Trip Details” route correctly to a dynamic `/trips/:id` page?
- Are planned activities/booked accommodations totals based on live associated records?

The review should be structured using the below headings:
- Detailed bullet point summary  
- Areas for Improvement  
- File References
```

---

```markdown
**Prompt 3 – Recent Trips List Review**

Review the **Recent Trips** list:
- Are these trips retrieved from a paginated API sorted by `endDate DESC`?
- Are trips filtered by completed status (i.e., end date < today)?
- Are destinations and activity counts dynamically calculated or hardcoded?
- Is the “Completed” label conditional based on status/date logic?
- Do trips link to detail pages correctly?

The review should be structured using the below headings:
- Detailed bullet point summary  
- Areas for Improvement  
- File References
```

---

```markdown
**Prompt 4 – Create New Trip Button Logic**

Verify the “Create New Trip” button:
- Does it navigate to a proper route (`/trips/new` or similar)?
- Is the destination page a working form powered by a live POST API?
- If role-based access is in place, is the button disabled or hidden when not allowed?

The review should be structured using the below headings:
- Detailed bullet point summary  
- Areas for Improvement  
- File References
```

---

Let me know if you’d like to continue with **Friends**, **Messages**, or any other social/shared features next.
