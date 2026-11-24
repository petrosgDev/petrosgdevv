# Security Specification — Portfolio Admin Studio (Firestore Rules)

## 1. Data Invariants
1. **Single-Owner Admin Authorization**: Only a signed-in Google account with `request.auth.token.email_verified == true` and `request.auth.token.email == 'petrosgeto7@gmail.com'` may create, update, or delete `/portfolio/published`.
2. **Exact Document Path Confinement**: Only document ID `published` matching `^[a-zA-Z0-9_\-]+$` (<= 128 chars) is accessible; all other paths and collection `list` queries are denied.
3. **Strict Schema & Size Bounds**: Every top-level key is explicitly allowlisted via `hasAll` + `hasOnly` on create and `affectedKeys().hasOnly(...)` on update. Every string and list enforces explicit `.size()` ceilings.
4. **Identity & Temporal Integrity**: `updatedByUid` must equal `request.auth.uid`; `updatedByEmail` must equal `'petrosgeto7@gmail.com'`; `createdAt` must equal `request.time` on create and remain immutable on update; `updatedAt` must equal `request.time` on every write.
5. **Default-Deny Catch-All**: Any collection or document not explicitly matched is denied for all reads and writes.

## 2. The "Dirty Dozen" Adversarial Payloads (All Must Return PERMISSION_DENIED)
1. **Unauthenticated Write**: Anonymous client attempts `setDoc(/portfolio/published, validPayload)`.
2. **Non-Owner Google Account**: Authenticated user `attacker@gmail.com` (`email_verified: true`) attempts `setDoc(/portfolio/published, validPayload)`.
3. **Unverified Admin Email Spoof**: Authenticated user with `email: 'petrosgeto7@gmail.com'` and `email_verified: false` attempts `updateDoc(/portfolio/published, ...)`.
4. **Shadow / Ghost Field Injection**: Admin attempts create/update adding an unlisted key `isSuperAdmin: true`.
5. **Identity Spoofing (`updatedByUid`)**: Admin submits `updatedByUid: 'other-uid'` that does not match `request.auth.uid`.
6. **Immutable `createdAt` Tampering**: Admin attempts update that modifies `createdAt`.
7. **Client-Forged `updatedAt` Timestamp**: Admin submits `updatedAt: Timestamp.fromMillis(1000)` instead of `serverTimestamp()` (`request.time`).
8. **ID Poisoning / Arbitrary Document Creation**: Admin attempts `setDoc(/portfolio/evil_doc, validPayload)` or a 200-char document ID.
9. **Resource Exhaustion (Oversized Array)**: Admin submits `PROJECTS` with 41 entries (> 40 limit) or `SKILL_CATEGORIES` with 25 entries (> 20 limit).
10. **Value Poisoning (Wrong Field Type)**: Admin updates `PROJECTS` to a string or `SITE_PROFILE` to an array instead of a map.
11. **Collection Enumeration (`list`)**: Public or authenticated client attempts `getDocs(collection(db, 'portfolio'))`.
12. **Unmatched Collection Write**: Authenticated user attempts `setDoc(/admins/me, { role: 'admin' })`.
