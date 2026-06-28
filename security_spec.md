# Security Specification for Firestore Security Rules

## 1. Data Invariants
1. **Public Reading of Content**: Anyone (including unauthenticated visitors) can read all blog posts, projects, and the main profile document so that the portfolio is fully visible to the public.
2. **Authorized Modification**: Only authenticated users (admins) can create, update, or delete blog posts, projects, and the profile.
3. **Immutable Timestamps**: Once a blog post or project is created, its `createdAt` field cannot be modified.
4. **Strict Schema Constraints**: No shadow fields or unapproved properties can be injected into any document.
5. **Length and Type Safety**: Every field must have strict type constraints and maximum size constraints (e.g., titles must be string under 200 characters).

---

## 2. The "Dirty Dozen" Payloads (Security Attack Vectors)

### Collection: `blogs`
1. **Unauthenticated Write**: An unauthenticated request attempts to create a blog post.
   - *Expected*: `PERMISSION_DENIED`
2. **Shadow Field Injection**: A user attempts to create a blog post with an unapproved key `isApproved: true` or `isAdmin: true`.
   - *Expected*: `PERMISSION_DENIED`
3. **Invalid/Excessive Title Size**: A user attempts to create a blog post with a title exceeding 200 characters.
   - *Expected*: `PERMISSION_DENIED`
4. **Invalid Blog Category**: A user attempts to create a blog post with an invalid category (e.g., '비밀일기' instead of '개발일지', '일상', or '작품감상평').
   - *Expected*: `PERMISSION_DENIED`
5. **Immutability Breach (`createdAt`)**: A user attempts to update a blog post's `createdAt` field after creation.
   - *Expected*: `PERMISSION_DENIED`
6. **Non-Integer `createdAt`**: A user attempts to set `createdAt` as a string or a boolean.
   - *Expected*: `PERMISSION_DENIED`

### Collection: `projects`
7. **Unauthenticated Project Creation**: An unauthenticated request attempts to create a project.
   - *Expected*: `PERMISSION_DENIED`
8. **Excessive Project Description**: A user attempts to set a project description longer than 1000 characters.
   - *Expected*: `PERMISSION_DENIED`
9. **Shadow Field Injection**: A user attempts to add an unapproved `ranking: 1` field to the project document.
   - *Expected*: `PERMISSION_DENIED`
10. **Immutability Breach (`createdAt`)**: A user attempts to update a project's `createdAt` field.
    - *Expected*: `PERMISSION_DENIED`

### Collection: `profile`
11. **Unauthenticated Profile Modification**: An unauthenticated request attempts to overwrite the `main` profile document.
    - *Expected*: `PERMISSION_DENIED`
12. **Excessive Bio Length**: A user attempts to set a biography exceeding 2000 characters.
    - *Expected*: `PERMISSION_DENIED`

---

## 3. The Test Runner Configuration

We define standard Jest/Mocha-style test cases in `firestore.rules.test.ts` to execute these checks. (Since we are in a lightweight preview container, the actual rule enforcement is verified via our live-deployed Firestore Emulator or Rules Engine).
