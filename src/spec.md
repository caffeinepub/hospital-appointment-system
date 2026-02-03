# Specification

## Summary
**Goal:** Improve the AI chatbot so it provides safe, non-diagnostic symptom-based next steps and recommends an appropriate doctor (including specific doctors from the directory when available).

**Planned changes:**
- Update backend chatbot responses for symptom questions to: acknowledge symptoms, give basic self-care/monitoring guidance, list urgent red flags, include a brief non-diagnostic disclaimer, and recommend a doctor specialization via a symptom→specialization mapping.
- Enhance backend responses to include at least one matching doctor name + specialization from the existing seeded doctor directory when the recommended specialization is available; otherwise suggest browsing the Doctors page.
- Make the backend HTTP outcall URL-safe by URL-encoding the user’s question before constructing the request, and ensure a helpful fallback response if the outcall fails/returns invalid content.
- Update the frontend chat UI rendering so multi-paragraph/bulleted guidance remains readable (line breaks preserved) and show a friendly fallback message (not raw/debug output) on empty/error responses.

**User-visible outcome:** When users describe symptoms (e.g., “I have fever and headache”), the chatbot replies in clear English with safe next steps, red-flag warnings, and a recommended doctor specialization—often including one or more relevant doctor names from the app’s directory—formatted readably in the chat.
