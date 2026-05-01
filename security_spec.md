# Security Specification for Chikitsa AI

## Data Invariants
1. **User Bio-Identity**: A user profile must match the authenticated `request.auth.uid`. Users cannot read or modify other users' profiles.
2. **Clinical Record Attribution**: Every medical report MUST belong to a valid `userId` which matches the creator's UID.
3. **Immutability of History**: `createdAt` and `userId` fields are immutable once written.
4. **Deterministic Urgency**: Urgency must be one of the pre-defined clinical levels.
5. **PII Protection**: User emails and clinical summaries are strictly restricted to the owner.

## The Dirty Dozen Payloads (Target: Permission Denied)

1. **Identity Theft**: Attempt to create a report with another user's `userId`.
2. **Ghost Profile**: Attempt to create a user profile for a different UID.
3. **Shadow Update**: Attempt to update a report title while also injecting an unauthorized `isAdmin` field.
4. **History Rewriting**: Attempt to change the `createdAt` timestamp of a report.
5. **Status Forgery**: Attempt to move a report from "In Review" to "Ready" without being a system-verified process (for this MVP, only owner can update, but we'll restrict fields).
6. **Query Scraping**: Attempt to list all reports in the database without a `where` filter on `userId`.
7. **Junk ID Poisoning**: Attempt to use a 1MB string as a document ID.
8. **Resource Exhaustion**: Sending a report with a 1MB summary field.
9. **Relational Orphan**: Creating a report for a non-existent user profile (Checked via `exists`).
10. **Admin Escalation**: Attempt to read the `admins` collection (which doesn't exist yet, but should be denied by default).
11. **PII Leak**: Authenticated user trying to 'get' another user's specific report by ID.
12. **Cross-Tenant Notification**: Attempt to create a notification for a different user.

## Verification
These payloads will be tested using `firestore.rules.test.ts`.
