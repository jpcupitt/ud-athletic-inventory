# ud-athletic-inventory

## About This Project

Equipment inventory management app for UD Athletics. Tracks equipment on hand, issuance to student-athletes, purchase orders, and vendor/budget spend across sports. Replaces spreadsheet-based tracking with a single source of truth for the equipment room.

**Primary users:** equipment room staff (inventory, issuance, ordering, reconciliation).

**Stack:** React 19 + TypeScript + Vite, Tailwind CSS v4, React Router, Recharts for reporting, MSAL (Microsoft Entra) for auth. Deploys as an Azure Static Web App (`staticwebapp.config.json` present).

**Data sources:** currently mock data under `src/data/mock/` (athletes, inventory, orders, staff, vendors, transactions). A real backend/data layer is not yet wired up — when it is, follow the storage decision tree in the database standard (Cosmos DB serverless is the default for internal tools like this).

### Data Classification
This project handles **Level II** data: student-athlete identity paired with non-public equipment issuance and order records (FERPA-adjacent internal data). Safe to use with AI tools, but avoid sending full datasets — use samples or aggregates when working with Claude. No health data (PHI) belongs in this system; if equipment issuance ever needs to reference a medical reason or Sports Medicine record, stop and flag it to Jack Davis (jackdav@udel.edu) before proceeding — that would make the data Level III.

---

## UD Athletics Standards

@../ud-athletics-ai-standards/standards/Brand/branding.md

@../ud-athletics-ai-standards/standards/data-viz.md

@../ud-athletics-ai-standards/standards/Security/security.md

@../ud-athletics-ai-standards/standards/Azure/azure-infrastructure.md

@../ud-athletics-ai-standards/standards/Azure/deployment.md

@../ud-athletics-ai-standards/standards/Azure/authentication.md

@../ud-athletics-ai-standards/standards/Azure/database.md

@../ud-athletics-ai-standards/standards/Azure/monitoring.md

@../ud-athletics-ai-standards/standards/FrontendDesign/react-ts-conventions.md

---

## How to Apply These Standards

### Branding and Data Visualization
Apply branding and data viz standards automatically when building any UI, chart, or visual output. No need to call out every decision - just build to spec.

### Security
When a task involves data handling, credentials, or anything touching the security standards:
- Follow the standards by default
- If something is unclear - especially around data classification, PHI, or AI tool boundaries - stop and flag it to the user
- Direct any security questions or approval requests to Jack Davis (jackdav@udel.edu)
- Do not proceed with any action that may involve Level III data until the user confirms the data source and classification

### Monitoring
Every app must have Application Insights instrumented before going live. Follow the setup checklist in the monitoring standard.

### When in Doubt
Ask the user before proceeding.
