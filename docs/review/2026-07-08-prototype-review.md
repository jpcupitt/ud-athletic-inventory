# Prototype Review — ud-athletic-inventory

**Date:** 2026-07-08
**Scope:** Full-codebase review of the student-built equipment inventory prototype: objective correctness errors, security risks, UD Athletics branding compliance, and build health. Conducted ahead of the data-layer build-out and Azure Static Web App pilot launch.
**Method:** Four independent review passes (correctness, security, branding/data-viz, build verification), findings verified against actual code.

---

## Executive summary

The prototype is a genuinely solid piece of work for someone with no prior software development experience — the UI is complete, the React architecture uses a clean and consistent context pattern, and chart-type selection fully complies with the data-viz standard. However, it is a **front-end demo, not a near-production app**:

1. **There is no real authentication.** MSAL is installed but never imported. What exists is a hardcoded username/password in source, a no-credential "viewer" button, and a fake SSO button that grants manager access locally. `staticwebapp.config.json` has no route protection, so a deploy today would be fully open to the internet.
2. **The production build fails.** `npm run build` stops on 7 TypeScript errors. The app was only ever run via `npm run dev`, which skips type-checking.
3. **The core inventory-issuance link is broken.** The item detail page compares SKU against inventory ID, so "Currently Issued To" is always empty — for every item, always.
4. **Branding has three real violations:** wrong font family app-wide, a prohibited yellow-lettered logo, and off-palette chart colors with UD Gold misused as a routine series color.

None of this diminishes the value of the prototype: the flows, screens, and data model are a strong foundation, and the equipment staff requirements it encodes are the hard part. The items below are ordered by what must be fixed before pilot launch.

---

## 🔴 Critical — go-live blockers (security)

### C1. Hardcoded credentials and fake authentication
- [`src/pages/Login.tsx:12`](../../src/pages/Login.tsx#L12) — login succeeds when `username === 'gohens' && password === 'delaware'`, a working credential committed to git. Anyone who views the deployed JS bundle can read it.
- [`src/pages/Login.tsx:80`](../../src/pages/Login.tsx#L80) — "Sign in as viewer" grants a session with zero credentials.
- [`src/pages/SignUp.tsx:96`](../../src/pages/SignUp.tsx#L96) — the "Continue with University of Delaware" SSO button is theater: it calls `login('manager')` locally with no redirect and no identity provider. Any visitor can self-provision a **manager** session.
- MSAL (`@azure/msal-browser`, `@azure/msal-react`) is in `package.json` but never imported anywhere in `src/`. Auth state is in-memory React state only ([`src/context/AuthContext.tsx:42`](../../src/context/AuthContext.tsx#L42)); route "protection" is a client-side `if (!user)` gate ([`src/App.tsx:35`](../../src/App.tsx#L35)) over data already shipped in the bundle.

**Fix:** delete the Login/SignUp credential flows entirely. Gate the app behind Static Web Apps' built-in Entra ID auth (`/.auth`), with role assignment for equipment staff. Treat auth as **not started**, not "needs configuration."

### C2. No platform-level route protection
- [`staticwebapp.config.json`](../../staticwebapp.config.json) contains only a `navigationFallback` — no `routes`, no `allowedRoles`, no `auth` block. Deployed as-is, every route is anonymously reachable and the platform enforces nothing.

**Fix:** define the Entra `identityProviders` block, `routes` with `allowedRoles`, and a 401 override in `staticwebapp.config.json`. This is where real protection lives for an SWA.

---

## 🟠 High

### H1. `npm run build` fails — 7 TypeScript errors
The build script (`tsc -b && vite build`) never reaches Vite:

| File | Error |
|---|---|
| `src/pages/Dashboard.tsx:751` | `category` and `sports` don't exist on `LowInventoryItem` (see also M3 — this is a real runtime crash) |
| `src/pages/Orders/OrderDetail.tsx:62,69` | `order` is possibly `undefined` |
| `src/hooks/useSportsAccess.ts:11,16` | `string` not assignable to `Sport` |
| `src/context/AuthContext.tsx:15` | unused `ALL_SPORTS` |

### H2. `xlsx@0.18.5` has two unpatched high-severity CVEs, fed user-uploaded files
- Prototype Pollution (CVE-2023-30533) and ReDoS (CVE-2024-22363); `npm audit` reports **no fix available** on the npm registry line (fixes exist only in SheetJS's self-hosted 0.20.2+).
- Exposed at [`src/pages/Orders/OrdersList.tsx:112`](../../src/pages/Orders/OrdersList.tsx#L112), where `XLSX.read()` parses a file from the user's file picker.

**Fix:** migrate to the SheetJS-hosted package (0.20.3+) or a maintained alternative such as `exceljs`.

### H3. "Currently Issued To" is always empty — key mismatch
- [`src/pages/Inventory/InventoryDetail.tsx:24,30`](../../src/pages/Inventory/InventoryDetail.tsx#L24) filters issuance records with `i.itemId === item.itemId` (the SKU, e.g. `FB-H001`), but every `issuedItems[].itemId` stores the inventory **`id`** (e.g. `inv-010`). The two never intersect, so issuance tracking — the app's core purpose — shows nothing for every serialized item.

**Fix:** compare `i.itemId === item.id`.

---

## 🟡 Medium

### M1. Realistic student-athlete PII committed to git
`src/data/mock/athletes.ts` contains names that read as the actual UD Men's Basketball roster (e.g. "Jyare Davis", "Kahlil Whitney"), paired with jersey numbers, class year, and sizing notes — Level II data per the project's classification. **Mitigations verified:** the GitHub repo is private, and no emails/phones/DOBs appear. But if the repo is ever made public or shared further, FERPA-adjacent records leak; and today this data ships in the JS bundle to any browser.
**Fix:** replace with clearly synthetic names now; never bundle real roster data client-side once the backend exists.

### M2. Authorization is entirely client-side — must not become the security model
Sport-scoping ([`src/hooks/useSportsAccess.ts:14-17`](../../src/hooks/useSportsAccess.ts#L14)) and `isManager`/`isLead` checks across Dashboard, Orders, Reports, and Settings all filter data *after* it reaches the browser. Cosmetic today (mock data); dangerous tomorrow if the API trusts it.
**Fix (design constraint for the data layer):** the API must enforce role and sport-scope server-side from the auth token. Client filtering is UX only.

### M3. Dashboard "Low Inventory" modal crashes when it has anything to show
[`src/pages/Dashboard.tsx:751`](../../src/pages/Dashboard.tsx#L751) renders `item.category` and `item.sports.join(', ')`, but the notification objects are `{ key, id, description, qtyOnHand }` — `.join` on `undefined` throws. Currently masked only because no mock item is below the threshold. The moment real data has a low-stock item, opening the modal crashes the page. (Same root cause as two of the H1 type errors.)

### M4. Detail pages and notifications read static mock modules, not the shared contexts
- [`src/pages/Inventory/InventoryDetail.tsx:3,9`](../../src/pages/Inventory/InventoryDetail.tsx#L3) reads the mock array directly: items created via "+ New Item" 404 ("Item not found"), and issue/return/archive changes never appear on the detail page.
- [`src/hooks/useNotifications.ts:2-6`](../../src/hooks/useNotifications.ts#L2) imports all five mock modules with `[]` memo deps: the Low Inventory / Overdue Returns badges and the bell count never change no matter what the user does.

**Fix:** route all reads through the contexts. This is the single highest-leverage code change and a great teaching point — it also becomes the natural seam for the real data layer.

### M5. Mock issuance records don't reconcile with inventory
Many `issuedItems` entries in `athletes.ts`/`staff.ts` carry descriptions/prices that contradict the inventory row they reference (e.g. `inv-021` issued as "BP Shorts NAVY" @ $35 but is "Game Jersey HOME WHITE" @ $85), and staff reference `inv-042`–`inv-059`, which don't exist. Returns credit the wrong item or silently vanish. Matters mostly as a data-quality warning for the SaaS migration: **the import must validate referential integrity.**

---

## 🎨 Branding & data-viz violations

### B1. Wrong fonts app-wide
[`index.html:10`](../../index.html#L10) and [`src/index.css:15`](../../src/index.css#L15) load **Josefin Sans** for everything. The standard requires **Oswald** for headings and **Open Sans** for body; neither is loaded anywhere.
**Fix:** swap the Google Fonts link, set Open Sans as body, add an Oswald heading style.

### B2. Prohibited logo
`public/Delaware-Blue-Hens-logo.png` (used in Sidebar, NavBar, Login, SignUp) has yellow "DELAWARE" lettering. Logos may be UD Blue, white, or black only — never yellow — and this isn't one of the approved athletic marks.
**Fix:** replace with an approved mark from the standards repo's logo assets.

### B3. Off-palette colors and UD Gold misuse (concentrated in Dashboard)
- Off-brand hexes in charts/UI: `#4169E1` (royal blue bars), `#CC8800` (amber line), `#228B22` (green button), `#1A6FBA`, `#B38600` — none in the palette. ([`src/pages/Dashboard.tsx`](../../src/pages/Dashboard.tsx) lines 306, 400, 412, 596, 622, 664, 871, 891)
- UD Gold `#FFD200` used as the routine second bar series (Dashboard.tsx:403, 415, 585) instead of a single highlight per visual.
- The "navy" used across ~15 files is `#002855` — an eyeballed value; the brand Dark Navy is `#003c71`.
- Bar charts use legends/swatch keys instead of direct labels (BudgetVsSpendReport.tsx:139,159,272; Dashboard on-hand and budget charts).

**Fix:** replace off-brand hexes with palette values, use two blue tones for two-series bars (as `BudgetVsSpendReport.tsx` already does — it's the template), reserve gold for one highlight, global-replace `#002855` → `#003c71`, and tokenize the palette once as Tailwind v4 `@theme` variables instead of ~20 files of hardcoded hex.

**Compliant already:** chart-type selection is exactly right (bars for categories, one line chart for the time series, tables for exact values, zero pie/donut/3D), gridlines and white backgrounds match the data-to-ink checklist.

---

## 🟢 Low / polish

- Missing React `key` on mapped fragments: `AthletesList.tsx:175-186`, `SubmittedOrdersReport.tsx:48-91`, plus 4 oxlint `jsx-key` hits in `OrderHistoryReport.tsx`/`OnHandReport.tsx`.
- Dead ternary in [`useSportsAccess.ts:19-21`](../../src/hooks/useSportsAccess.ts#L19) — both branches identical, so the lead role's access model is ambiguous. Fix before it becomes the template for server-side rules.
- Settings "Save" buttons don't persist ([`src/pages/Settings.tsx:179,198`](../../src/pages/Settings.tsx#L179)) and avatar initials don't update after a name edit.
- 24 oxlint warnings, including 6 `exhaustive-deps` issues (memos depending on values recreated every render).
- Bundle is a single 1.24 MB JS chunk (347 KB gzip) — add route-based code-splitting before launch.
- Unused Vite boilerplate: `src/App.css`, `src/assets/react.svg`, `src/assets/vite.svg`.
- App Insights not yet instrumented — required before go-live per the monitoring standard (`appi-ud-athletics-{app}` pattern).

---

## ✅ What the student did well

Worth saying explicitly in feedback — several of these are things experienced developers get wrong:

- **Clean, consistent React context architecture** with immutable state updates, `Math.max(0, …)` guards, and typed `useX` hooks that throw outside their provider.
- **Correct derived-state handling**: `OrderDetail`'s dirty-tracking (`editedLines`/`isDirty`/`computeStatus`) and the auto-status logic in order creation are right and mirror each other.
- **Secrets hygiene**: `.gitignore` covered `.env` before the first commit, `.env.example` has placeholders only, nothing sensitive in git history, repo kept private.
- **No XSS sinks**: no `dangerouslySetInnerHTML`/`innerHTML`/`eval` anywhere.
- **Fully compliant chart-type selection**, and `BudgetVsSpendReport.tsx` is a genuinely well-executed brand-standard chart.
- Sensible empty states, optional chaining, and singular/plural handling throughout.

The cross-cutting teaching point: detail pages and the notifications hook read static mock modules instead of the shared contexts (M3, M4). Routing everything through the contexts fixes the stale-data and dead-end bugs at once — and that seam is exactly where the real API will plug in.

---

## Recommended sequence to go-live

1. **Fix pass (this repo):** C1–C2 stubs removed, H1 build errors, H3 key mismatch, M3 crash, branding B1–B3, low-severity cleanups.
2. **Data layer:** Cosmos DB serverless + SWA managed Azure Functions; API enforces role + sport-scope server-side (M2); contexts become the client seam (M4).
3. **Auth:** SWA built-in Entra ID, equipment-staff role assignment, `staticwebapp.config.json` route rules.
4. **Migration:** one-time SaaS export import with referential-integrity validation (M5); replace mock roster names (M1).
5. **Launch checklist:** App Insights instrumentation, code-splitting, `xlsx` replacement (H2), pilot alongside the current SaaS.
