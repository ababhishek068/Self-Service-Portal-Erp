# Self Service ERP

Production-ready **administration console** for Hijra Bank Self Service — same visual theme as the employee portal, with full organizational control. No Business Central dependency: data lives in a browser-local enterprise store until your Self Service API is ready.

## Quick start

```bash
cd self-service-erp
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

**Sign in:** `admin` / `demo` (super admin) or `finance` / `demo` (finance admin)

## What this app does

Acts as the **ERP back office** that the portal will eventually read/write via your API:

| Area | Capabilities |
|------|----------------|
| **Command Center** | KPIs, module breakdown, system health, recent transactions |
| **All requests** | Search, filter, open any portal transaction |
| **Finance / Facility / HR** | Per-module registries (same modules as Self Service Portal) |
| **Master data** | Employees, departments, item catalog (+ stock adjustments) |
| **Workflow** | Approval rules (amount ranges, departments) |
| **Audit trail** | Every admin action logged |
| **Data store** | Export / import JSON, reset seed — `localStorage` key `hijra-self-service-erp-v1` |

### Admin actions on requests

- Approve, reject, post, cancel, revert to draft  
- Reassign approver  
- Delete (with audit)  

## Stack

React 19, Vite 8, TypeScript, Tailwind CSS v4, TanStack Query, React Router v6, Lucide icons, date-fns — aligned with `SelfServicePortal/self-service-portal`.

## Connect your backend later

1. Set **System Settings → Portal API base URL** when the API exists.  
2. Replace functions in `src/data/database.ts` with `fetch` to your endpoints.  
3. Keep `src/types/erp.types.ts` shared with the portal for compatible payloads.

The portal can then `GET`/`POST` employees, requests, items, and settings from the same API this UI will use.

## Build

```bash
npm run build
npm run preview
```
