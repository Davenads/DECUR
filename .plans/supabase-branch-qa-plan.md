# QA Plan: feature/supabase-foundation Pre-Merge Checklist

## Overview

This document covers every user flow and edge case to validate on
`feature/supabase-foundation` before merging into `main` and deploying
to production. Work through each section in order - earlier sections
establish the accounts and data that later sections depend on.

**Prerequisites before starting:**
- `supabase start` running locally (all containers healthy)
- `npm run dev` running on `localhost:3000`
- At least two browser profiles available (to simulate admin + regular user)
- Mailpit open at `http://127.0.0.1:54324`
- Supabase Studio open at `http://127.0.0.1:54323`

---

## Section 1 - Email/Password Registration

### 1.1 New account creation (fresh email)
- [ ] Navigate to `/auth/register`
- [ ] Submit with a new email (e.g. `qa1@test.com`) and valid password (8+ chars)
- [ ] Confirm "Check your email" screen appears with correct email shown
- [ ] Open Mailpit - verify confirmation email arrived
- [ ] Click "Confirm your email address" in Mailpit
- [ ] Confirm redirect lands on `/auth/verify` (not `/`, not a 404)
- [ ] Confirm user is automatically signed in after verification
- [ ] Confirm redirect goes to `/profile` after verify
- [ ] Open Supabase Studio - verify row created in `profiles` table with correct `display_name`

### 1.2 Duplicate email rejection
- [ ] Attempt to register again with the same email used in 1.1
- [ ] Confirm error message appears (not a crash or blank screen)

### 1.3 Password validation
- [ ] Attempt to register with passwords that don't match - confirm error
- [ ] Attempt to register with a 7-character password - confirm "at least 8 characters" error

### 1.4 Optional display name
- [ ] Register a second account (`qa2@test.com`) leaving the display name blank
- [ ] Confirm `display_name` in Supabase Studio falls back to the email prefix (everything before `@`)

---

## Section 2 - Sign In / Sign Out

> **Automated coverage:** 2.1 (redirect + UserMenu name), 2.2, 2.3 (redirect + Sign in visible), 2.4a/b. Items below marked `[MANUAL]` were skipped by the automated suite and require a real browser session.

### 2.1 Email/password login
- [ ] Sign out if currently logged in
- [ ] Navigate to `/auth/login`
- [ ] Submit correct credentials for `qa1@test.com`
- [ ] Confirm redirect to `/profile`
- [ ] Click the avatar circle in the top-right nav to open the dropdown
- [ ] **Expected:** Dropdown opens showing the display name ("QA User One" or the email prefix) as a bold label at the top, with the email address in smaller muted text beneath it

### 2.2 Wrong password
- [ ] Submit with `qa1@test.com` but wrong password
- [ ] **Expected:** Inline error appears ("Invalid credentials" or similar). No crash, no blank screen, form stays on `/auth/login`

### 2.3 Sign out `[MANUAL]`

This is the most important manual check because `window.location.href = '/'` (hard redirect) vs `router.push('/')` (client-side nav) behaves differently - only the hard redirect reliably clears the Supabase cookie on sign-out.

**Steps:**
1. Sign in as `qa1@test.com` - confirm you are on `/profile`
2. Click the avatar circle (top-right nav) to open the UserMenu dropdown
3. **Expected:** Dropdown panel opens showing: display name, email, "My Profile", "Saved Items", "Submit Contribution", and "Sign out" (red text at bottom)
4. Click "Sign out"
5. **Expected (hard redirect):** The browser performs a full page reload - the URL bar briefly shows `/` and the page fully refreshes (you should see the browser loading indicator). This is NOT a smooth client-side transition.
6. **Expected after reload:** The avatar circle is gone from the nav. In its place is a "Sign in" text link (with a person icon).
7. Open the browser DevTools (F12) → Application tab → Cookies → `localhost`
8. **Expected:** The `sb-127-auth-token` cookie (or `decur-auth-v1`) is absent or expired. If it still has a future expiry, sign-out is not working correctly.
9. Navigate to `/profile` directly
10. **Expected:** Immediate redirect to `/auth/login?redirect=%2Fprofile`. The protected route guard is working.

**What failure looks like:** After clicking "Sign out", the page updates client-side (no full reload), the UserMenu might still show the avatar for a moment, and navigating to `/profile` succeeds (cookie still valid). This was the bug before the `window.location.href` fix.

### 2.4 Redirect after login
- [ ] While signed out, navigate to `/profile`
- [ ] **Expected:** Redirect to `/auth/login?redirect=%2Fprofile` (URL-encoded `/profile` in the query param)
- [ ] Sign in with valid credentials
- [ ] **Expected:** Redirect lands back on `/profile`, not on the homepage (`/`)

---

## Section 3 - Password Reset

> **Automated coverage:** 3.1 (request + Mailpit email), 3.2 landing URL. The password-entry form check (3.2) was skipped because the form only renders after a `PASSWORD_RECOVERY` Supabase auth event fires from the redirect chain - which requires a real browser to follow the full link.

### 3.1 Reset request
- [ ] Sign out first (the reset form should be usable while logged out)
- [ ] Navigate to `/auth/reset-password`
- [ ] **Expected:** Page shows a single email input with a "Send reset link" (or similar) button. The new-password form is NOT visible yet.
- [ ] Enter `qa1@test.com` and submit
- [ ] **Expected:** "Check your email" confirmation text appears. The form disappears or is replaced by the confirmation message.
- [ ] Open Mailpit at `http://127.0.0.1:54324`
- [ ] **Expected:** An email from the Supabase sender address appears for `qa1@test.com` with subject containing "Reset" or "Password"

### 3.2 Reset link flow `[MANUAL]`

This section requires a real browser because Supabase's reset link uses a URL hash fragment (`#access_token=...&type=recovery`) which is never sent to the server - only client-side JavaScript can read it. Playwright's headless handling of the redirect chain is unreliable for this flow.

**Steps:**
1. In Mailpit, click the reset link (the button/link inside the email body labeled "Reset Password" or similar)
2. The link goes to `http://127.0.0.1:54321/auth/v1/verify?token=...&type=recovery&redirect_to=http://localhost:3000/auth/reset-password`
3. Supabase verifies the token and redirects to `http://localhost:3000/auth/reset-password#access_token=...&type=recovery`
4. **Expected:** The page at `/auth/reset-password` renders the **new-password entry form** (two password fields + a "Update password" button). NOT the email request form. If you see the email input form, the `PASSWORD_RECOVERY` event did not fire.
5. Enter a new valid password (8+ characters) in both fields
6. Click "Update password"
7. **Expected:** Success message ("Password updated" or similar) appears briefly, then redirect to `/auth/login` or `/profile`
8. Sign out if auto-logged in
9. Sign in at `/auth/login` with `qa1@test.com` and the **new** password
10. **Expected:** Successful login and redirect to `/profile`
11. Sign out, then attempt to sign in with the **old** password
12. **Expected:** "Invalid credentials" error. The old password is rejected.

**If the form doesn't appear (known edge case):** The `PASSWORD_RECOVERY` event fires only when the page JS reads the hash on load. If you copy-paste the link into a new tab instead of clicking it from Mailpit, the hash may be stripped. Always click the link directly in the email client.

---

## Section 4 - OAuth (GitHub)

### 4.1 Login via GitHub
- [ ] Sign out
- [ ] Click "Continue with GitHub" on `/auth/login`
- [ ] Confirm redirect to GitHub authorization page
- [ ] Authorize the DECUR app
- [ ] Confirm redirect back to `/auth/verify` then `/profile`
- [ ] Confirm UserMenu shows the GitHub account's name/email
- [ ] Open Supabase Studio - confirm new row in `profiles` table

### 4.2 Register via GitHub
- [ ] Sign out
- [ ] Click "Continue with GitHub" on `/auth/register`
- [ ] Authorize (or use a different GitHub account if already authorized)
- [ ] Confirm same flow as 4.1 - lands on `/profile` with a new profile row

### 4.3 Existing email collision (GitHub)
- [ ] Sign out
- [ ] Attempt GitHub OAuth with a GitHub account whose email matches an existing
  email-password account (e.g. the David/admin account)
- [ ] Confirm Supabase links to the existing account (no duplicate profile row created)

---

## Section 5 - OAuth (Google)

### 5.1 Login via Google
- [ ] Sign out
- [ ] Click "Continue with Google" on `/auth/login`
- [ ] Confirm redirect to Google's consent screen (not "Access blocked: redirect_uri_mismatch")
- [ ] Authorize
- [ ] Confirm redirect back to `/auth/verify` then `/profile`
- [ ] Confirm UserMenu shows the Google account's display name

### 5.2 Register via Google
- [ ] Sign out
- [ ] Click "Continue with Google" on `/auth/register`
- [ ] Same flow as 5.1

### 5.3 Existing email collision (Google)
- [ ] Same as 4.3 but with Google - confirm no duplicate profile row

---

## Section 6 - Bookmarks

> **Automated coverage:** 6.1 (profile page loads), 6.2 (API toggle ×2), 6.4 (profile Saved tab). Items marked `[MANUAL]` require UI interaction that headless Playwright couldn't find via selector.

### 6.1 Bookmark a key figure (unauthenticated) `[MANUAL]`

The automated suite confirmed the profile page loads but could not reliably locate the BookmarkButton via CSS/ARIA selectors in headless mode (the button may be conditionally rendered or require hover state).

**Steps:**
1. Sign out completely
2. Navigate to `/figures/luis-elizondo` (or any key figure profile)
3. **Expected:** The page loads fully - profile name, tabs, and content are visible
4. Scroll through the page to locate the bookmark/save button. It may appear:
   - As a bookmark icon (ribbon/flag shape) in the top area of the profile card
   - As a "Save" button near the profile header
   - As a floating action button
5. Click the bookmark button
6. **Expected outcome A (redirect):** The page navigates to `/auth/login` (possibly with a `?redirect=` param pointing back to the figure)
7. **Expected outcome B (modal/prompt):** A login prompt or toast message appears saying "Sign in to save" or similar. The page does NOT navigate away.
8. **Not acceptable:** A silent failure (nothing happens), a console error, or a 401 response shown to the user

**Verify the redirect param (if outcome A):**
- After being redirected to `/auth/login`, check the URL
- **Expected:** URL contains `?redirect=%2Ffigures%2Fluiz-elizondo` or similar, so you'll return to the figure after login

### 6.2 Bookmark a key figure (authenticated)
- [ ] Sign in as `qa1@test.com`
- [ ] Navigate to a key figure profile
- [ ] Click the BookmarkButton - confirm it fills/toggles to "saved" state
- [ ] Navigate to `/profile` - confirm the figure appears in the "Saved" tab
- [ ] Click the bookmark again - confirm it toggles back to unsaved
- [ ] Navigate to `/profile` - confirm the figure is gone from the "Saved" tab

### 6.3 Bookmark other content types
- [ ] Bookmark a Case - confirm it appears in Saved tab with correct type badge
- [ ] Bookmark a Document - confirm same
- [ ] Bookmark a Program (if BookmarkButton is wired there) - confirm same

### 6.4 Saved tab state across sessions
- [ ] Bookmark 2-3 items
- [ ] Sign out and sign back in
- [ ] Navigate to `/profile` - confirm bookmarks are still there (persisted in DB, not local state)

---

## Section 7 - Collections

### 7.1 Create a collection
- [ ] Navigate to `/profile` - Collections tab
- [ ] Click "New collection"
- [ ] Enter a title and optional description
- [ ] Leave "Make collection public" unchecked
- [ ] Submit - confirm collection card appears in the list
- [ ] Check Supabase Studio - confirm row in `collections` table

### 7.2 Create a public collection
- [ ] Create another collection, this time checking "Make collection public"
- [ ] Confirm the "Public" green badge appears on the card
- [ ] Confirm a "Share link" link appears on the card

### 7.3 Share link
- [ ] Click "Share link" on the public collection card
- [ ] Confirm it opens `/collections/[uuid]` in a new tab
- [ ] Confirm the page renders the collection title, description, and owner name
- [ ] Sign out - navigate to the same `/collections/[uuid]` URL
- [ ] Confirm the page is publicly accessible without login

### 7.4 Private collection not publicly accessible
- [ ] Note the UUID of the private collection from Supabase Studio
- [ ] Sign out (or use a different account)
- [ ] Navigate to `/collections/[private-uuid]`
- [ ] Confirm 404 (not the collection contents)

### 7.5 Add items to a collection
- [ ] Navigate to a key figure profile while logged in
- [ ] Use the collection picker to add the item to a collection
- [ ] Navigate to `/profile` Collections tab - confirm item count increased on the card
- [ ] Click "Share link" on the public collection - confirm the item appears in the list

---

## Section 8 - Contribution Submission

### 8.1 Unauthenticated access
- [ ] Sign out
- [ ] Navigate to `/contribute/submit`
- [ ] Confirm redirect to `/auth/login?redirect=/contribute/submit`

### 8.2 Key figure submission (authenticated)
- [ ] Sign in as `qa1@test.com` (not admin)
- [ ] Navigate to `/contribute/submit`
- [ ] Select "Key Figure" type and complete Step 1
- [ ] Complete Step 2 (required fields only)
- [ ] Submit
- [ ] Confirm redirect to `/contribute/submitted`
- [ ] Check Supabase Studio - confirm row in `contributions` table with status `submitted`
- [ ] Check Discord - confirm webhook notification fired with submission details

### 8.3 Case submission
- [ ] Submit a Case type contribution
- [ ] Confirm same outcome as 8.2

### 8.4 Timeline event submission
- [ ] Submit a Timeline Event type contribution
- [ ] Confirm same outcome as 8.2

### 8.5 Correction submission
- [ ] Submit a Correction type contribution
- [ ] Confirm same outcome as 8.2

### 8.6 Profile page Submissions tab
- [ ] Navigate to `/profile` - Submissions tab
- [ ] Confirm the submissions from 8.2-8.5 appear with correct type badges and "Submitted" status
- [ ] Confirm submission date is shown

---

## Section 9 - Moderation Dashboard (Admin)

> **All items in this section are `[MANUAL]`** - they require the David/admin account. The automated suite verified that unauthenticated users get 401 and non-admin users get 403, but cannot test the admin UI itself.

**Setup before starting Section 9:**
1. Open Supabase Studio at `http://127.0.0.1:54323`
2. Navigate to Table Editor → `profiles`
3. Find the row for your David account (match by email)
4. Confirm the `role` column is set to `admin`. If not, edit the cell and save.
5. Make sure you have at least one `submitted` contribution in the `contributions` table (created during Section 8). If not, submit one as `qa1@test.com` first.

### 9.1 Admin Panel link visibility `[MANUAL]`

**Part A - Admin account sees the link:**
1. Sign in as the David/admin account
2. Click the avatar circle to open the UserMenu dropdown
3. **Expected:** An amber-colored "Admin Panel" menu item appears in the dropdown, visually distinct from the other links (different text color - amber/orange). It links to `/admin/contributions`.
4. **Not acceptable:** No "Admin Panel" link visible, or the link appears with the same color as other menu items (it should be amber to indicate elevated access)

**Part B - Regular user does NOT see the link:**
1. Sign out
2. Sign in as `qa1@test.com`
3. Click the avatar circle to open the UserMenu dropdown
4. **Expected:** The dropdown shows "My Profile", "Saved Items", "Submit Contribution", and "Sign out" - but NO "Admin Panel" link
5. **Not acceptable:** "Admin Panel" link visible to a non-admin user

### 9.2 Admin panel access guard
- [ ] While signed in as `qa1@test.com` (viewer), navigate to `/admin/contributions` directly
- [ ] **Expected:** Redirect to `/auth/login` or a 403 page. The admin queue content must NOT be visible.

### 9.3 Admin queue list `[MANUAL]`

1. Sign in as admin (David)
2. Navigate to `/admin/contributions`
3. **Expected:** A queue of pending contributions is displayed. You should see submissions created in Section 8 (title "Test Figure QA" and any others).
4. Verify each submission card shows: title, submitter email or display name, submission type badge (e.g. "figure"), submission date, and current status badge ("Submitted" in yellow/gray).
5. Click the "Submitted" filter tab
6. **Expected:** Only submissions with `submitted` status are shown. Count matches.
7. Click the "Under Review" tab
8. **Expected:** Empty (no submissions have been moved to that status yet)
9. Click "All"
10. **Expected:** Full list restored
11. Click into any submission to open the detail/review view
12. **Expected:** A detail panel or page opens showing the full submitted payload (name, roles, summary, source URLs, submitter note if any)

### 9.4 Review actions - Mark Under Review `[MANUAL]`

1. From the admin queue, open a "Submitted" contribution
2. Locate the "Mark Under Review" action button (may be labeled "Start Review" or similar)
3. Click it
4. **Expected:** Status badge on the detail view updates immediately to "Under Review" (blue badge)
5. Navigate back to the queue list (browser back button or breadcrumb)
6. **Expected:** The submission now appears under the "Under Review" filter tab, not under "Submitted"
7. Open Supabase Studio → Table Editor → `contributions`
8. Find the row - **Expected:** `status` column = `under_review`, `reviewer_id` = your admin user's UUID, `reviewed_at` is populated with a timestamp
9. Check `contribution_audit_events` table (if it exists) or `audit_log`
10. **Expected:** A row with `action = 'status_changed'` or similar, recording the transition from `submitted` → `under_review`

### 9.5 Review actions - Needs Revision `[MANUAL]`

1. From the admin queue, open a "Submitted" or "Under Review" contribution
2. Click "Needs Revision" (may require a note before submitting)
3. **Expected:** A text input appears to enter a reviewer note
4. Enter a note such as: "Please provide a more specific source URL and clarify the claimed clearance level."
5. Confirm/submit the action
6. **Expected:** Status badge updates to "Needs Revision" (orange/yellow badge)
7. Open Supabase Studio → `contributions` table
8. **Expected:** `status = 'needs_revision'`, `reviewer_note` column contains the note you entered
9. Sign out, sign in as `qa1@test.com`
10. Navigate to `/profile` → Submissions tab
11. Find the contribution
12. **Expected:** Status badge shows "Needs Revision". The reviewer note text is visible to the submitter (either inline on the card or in an expanded view). The submitter should understand what needs to be fixed.

### 9.6 Review actions - Reject `[MANUAL]`

1. Sign in as admin, open a "Submitted" contribution in the queue
2. Click "Reject"
3. **Expected:** A confirmation prompt or note field appears (rejection reason is optional but recommended)
4. Enter an optional note and confirm the rejection
5. **Expected:** Status badge updates to "Rejected" (red badge)
6. Check Supabase Studio → `contributions`: `status = 'rejected'`
7. Open Discord server → contribution webhook channel
8. **Expected:** A webhook message arrived with the rejection details (submission title, content type, submitter). If no Discord webhook is configured in local `.env`, this can be skipped for local dev - verify it will fire in prod by checking that `DISCORD_CONTRIBUTION_WEBHOOK_URL` is set.

### 9.7 Review actions - Approve `[MANUAL]`

This is the most complex action - it triggers both a brief download and outbound notifications.

**Steps:**
1. Sign in as admin, open a "Submitted" contribution in the queue
2. Click "Approve"
3. **Expected:** Status badge updates to "Approved" (green badge)
4. **Expected:** A green "Ready for implementation" panel appears below the submission details. This panel should contain a "Download Brief (.md)" button.
5. Click "Download Brief (.md)"
6. **Expected:** A `.md` file downloads to your machine (check Downloads folder). The filename should include the submission title or ID.
7. Open the file in a text editor - see Section 9.8 for content validation.
8. Check Mailpit at `http://127.0.0.1:54324`
9. **Expected:** An approval notification email was sent to the submitter (`qa1@test.com`). Subject should contain "approved" or "contribution". Body should reference the submission title.
10. Check Discord → webhook channel
11. **Expected:** A webhook message with approval details (same condition as 9.6 - verify env var for prod)

### 9.8 Brief content validation `[MANUAL]`

Open the `.md` file downloaded in 9.7 and verify the following:

**Header block:**
- [ ] Submission title is present
- [ ] Content type is identified (e.g. "Key Figure", "Case", "Timeline Event")
- [ ] Submitter display name or email is present
- [ ] Submission date/timestamp is present
- [ ] Approved-by (reviewer name or admin email) is present

**Submitted payload section:**
- [ ] All fields the user filled in are echoed back (name, roles, summary, source URLs, submitter note)
- [ ] No fields are missing or showing `undefined`/`null` as a string

**Schema skeleton section:**
- [ ] A partial DECUR JSON schema block is present, pre-filled with the submitted data
- [ ] Fields that require additional research (e.g. `clearance`, `education`, `key_events`) appear as `"TODO"` placeholders or empty arrays
- [ ] The skeleton is valid enough to be copy-pasted as a starting point for the actual profile JSON

**Research checklist section:**
- [ ] A checklist of items to research/verify before the entry goes live is present
- [ ] The checklist is appropriate for the content type (e.g. a Key Figure checklist includes: cross-reference roles with public records, verify organization affiliations, confirm dates, find 2-3 independent sources, etc.)

**Overall standard:** The `.md` file should be actionable - a developer receiving it cold should know exactly what was submitted, what schema it maps to, and what research still needs to be done before publishing.

---

## Section 10 - Route Guards

### 10.1 Protected routes redirect unauthenticated users
- [ ] Sign out
- [ ] Navigate to `/profile` - confirm redirect to `/auth/login?redirect=/profile`
- [ ] Navigate to `/profile#collections` - confirm redirect
- [ ] Navigate to `/contribute/submit` - confirm redirect
- [ ] Navigate to `/admin/contributions` - confirm redirect or 403

### 10.2 Protected routes allow authenticated users
- [ ] Sign in as `qa1@test.com`
- [ ] Navigate to `/profile` - confirm access
- [ ] Navigate to `/contribute/submit` - confirm access
- [ ] Navigate to `/admin/contributions` - confirm 403 (not admin)

### 10.3 Admin routes reject non-admins
- [ ] Sign in as `qa1@test.com` (viewer)
- [ ] Navigate to `/admin/contributions` - confirm 403
- [ ] Navigate to `/admin/contributions/[any-uuid]` - confirm 403

---

## Section 11 - Edge Cases

### 11.1 Unverified email access
- [ ] Register a new account but do NOT click the confirmation email
- [ ] Attempt to navigate to `/profile`
- [ ] Confirm redirect to login (session should not exist for unconfirmed email)

### 11.2 Session persistence across page refresh
- [ ] Sign in
- [ ] Hard refresh the page (Ctrl+Shift+R)
- [ ] Confirm still signed in (UserMenu shows the account)

### 11.3 Session persistence across new tab
- [ ] Sign in in one tab
- [ ] Open a new tab to `localhost:3000`
- [ ] Confirm still signed in

### 11.4 Sign out invalidates session on all tabs
- [ ] Sign in in two tabs (Tab A and Tab B)
- [ ] In Tab A, sign out
- [ ] In Tab B, hard refresh
- [ ] Confirm Tab B also shows the signed-out state

### 11.5 TypeScript build passes
- [ ] Run `npm run typecheck` - confirm 0 errors
- [ ] Run `npm run lint` - confirm 0 errors (or only pre-existing warnings)
- [ ] Run `npm run build` - confirm successful production build

---

## Section 12 - Mobile / Remote Device

### 12.1 Auth on mobile (Tailscale or local network)
- [ ] Access the dev server from a phone or secondary device
- [ ] Confirm login page loads (no "Failed to fetch" error)
- [ ] Sign in with email/password - confirm success
- [ ] Sign out - confirm works

### 12.2 OAuth on mobile
- [ ] Attempt "Continue with Google" from a mobile device
- [ ] Confirm the Google consent screen opens in the mobile browser
- [ ] Confirm the callback redirect works

---

## Sign-Off Criteria

### Automated (run `node scripts/qa-auth.mjs`)
The script must exit with `All automated checks passed.` (0 failures). As of the last run:
- **58 passed, 0 failed, 6 skipped** - the 6 skips are all accounted for manual checks below

### Manual (required before merge)
All of the following must be personally verified in a real browser with the David/admin account:

| # | Check | Section |
|---|---|---|
| M1 | Sign out triggers hard reload, clears auth cookie | 2.3 |
| M2 | Password reset form renders after clicking Mailpit link | 3.2 |
| M3 | New password accepted, old password rejected | 3.2 |
| M4 | BookmarkButton click prompts login when unauthenticated | 6.1 |
| M5 | Admin account sees amber "Admin Panel" in UserMenu | 9.1 |
| M6 | Non-admin account does NOT see Admin Panel link | 9.1 |
| M7 | Admin queue shows submitted contributions, filters work | 9.3 |
| M8 | "Mark Under Review" updates status + audit row in DB | 9.4 |
| M9 | "Needs Revision" with note is visible to submitter on /profile | 9.5 |
| M10 | "Reject" updates status, Discord webhook fires | 9.6 |
| M11 | "Approve" triggers brief download + Mailpit email + Discord | 9.7 |
| M12 | Downloaded brief has all required sections (see 9.8) | 9.8 |

### Additional checks
- [ ] No `console.error` output during any flow (F12 → Console tab, filter by "Errors")
- [ ] Supabase Studio `contributions`, `bookmarks`, `collections`, `profiles` tables all show data consistent with the actions above
- [ ] `npm run check` (lint + typecheck) passes with 0 errors

---

## Post-Merge Steps (not part of this QA)

1. Create a hosted Supabase project at supabase.com
2. Run migrations against the hosted project
3. Add prod env vars to Vercel (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_INTERNAL_URL, RESEND_API_KEY, DISCORD_CONTRIBUTION_WEBHOOK_URL, REVALIDATE_SECRET)
4. Create production GitHub OAuth app and Google OAuth client with prod callback URLs
5. Set SUPABASE_AUTH_EXTERNAL_GITHUB_* and SUPABASE_AUTH_EXTERNAL_GOOGLE_* in the hosted Supabase dashboard (not in Vercel env - these live in Supabase Auth settings for prod)
6. Remove "Only build production" ignored build step from Vercel (so the merged main build triggers normally)
7. Merge feature/supabase-foundation into main and push
