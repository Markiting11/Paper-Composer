# Firestore Security Specification

## Data Invariants
1. Users can only access their own profile data.
2. Only Admins can modify user status or roles.
3. Users can only access exam papers they created.
4. Global configuration is read-only for users and writeable only by admins.
5. All IDs must be valid alphanumeric strings.
6. Identity fields (userId, ownerId) must match the authenticated requester.

## The Dirty Dozen Payloads

### 1. Identity Spoofing (Create User)
**Target:** `/users/someone_else`
**Payload:** `{ "email": "attacker@evil.com", "role": "USER", "status": "PENDING", "createdAt": "2024-01-01T00:00:00Z" }`
**Expected:** `PERMISSION_DENIED` (auth.uid doesn't match ID)

### 2. Privilege Escalation (Self-Approval)
**Target:** `/users/my_uid`
**Payload:** `{ "status": "APPROVED" }` (Update attempt)
**Expected:** `PERMISSION_DENIED` (Non-admin cannot change status)

### 3. Privilege Escalation (Self-Admin)
**Target:** `/users/my_uid`
**Payload:** `{ "role": "ADMIN" }` (Update attempt)
**Expected:** `PERMISSION_DENIED` (Non-admin cannot change role)

### 4. Role Injection on Creation
**Target:** `/users/my_uid`
**Payload:** `{ "email": "me@me.com", "role": "ADMIN", "status": "APPROVED", "createdAt": "..." }`
**Expected:** `PERMISSION_DENIED` (New users must be status='PENDING' and role='USER')

### 5. Exam Paper Theft
**Target:** `/examPapers/other_user_paper`
**Payload:** `get()` request
**Expected:** `PERMISSION_DENIED` (userId mismatch)

### 6. Orphaning Exam Papers
**Target:** `/examPapers/new_paper`
**Payload:** `{ "userId": "different_uid", "data": { ... } }`
**Expected:** `PERMISSION_DENIED` (userId must match auth.uid)

### 7. Global Config Sabotage
**Target:** `/config/global`
**Payload:** `{ "signupEnabled": false }` (Update by non-admin)
**Expected:** `PERMISSION_DENIED`

### 8. Junk ID Injection
**Target:** `/users/%FF%00%AA`
**Payload:** `{ ... }`
**Expected:** `PERMISSION_DENIED` (Invalid ID)

### 9. Mass Exam Paper Listing
**Target:** `db.collection('examPapers').get()`
**Payload:** Query without userId filter
**Expected:** `PERMISSION_DENIED` (Rules must enforce owner check)

### 10. Immutable Field Modification
**Target:** `/users/my_uid`
**Payload:** `{ "createdAt": "1990-01-01T00:00:00Z" }`
**Expected:** `PERMISSION_DENIED` (createdAt is immutable)

### 11. Resource Exhaustion (Oversized Text)
**Target:** `/examPapers/my_paper`
**Payload:** `{ "data": { "title": "A".repeat(200000) } }`
**Expected:** `PERMISSION_DENIED` (Size limits exceeded)

### 12. PII Blanket Read
**Target:** `/users/some_random_uid`
**Payload:** `get()` request by another user
**Expected:** `PERMISSION_DENIED`

## Test Runner (Logic Outline)
The standard testing framework will be applied to verify that:
1. `request.auth.uid` matches `userId` in all paths.
2. `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN'` is required for admin actions.
3. `Arshad2097@gmail.com` is treated as a bootstrap admin.
