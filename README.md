# Validate a Technician

Public lookup site — a technician types in their ID number and sees which
Gravity Training certificates they hold and whether each is still valid,
expired, or flagged as fraudulent.

- `src/` — React/Vite front end (search box + results card).
- `api/validate/` — Azure Function that proxies the lookup to the internal
  `gravity-learner-kios` cert-validation service. The function key is kept
  server-side here so it never reaches the browser.

## Prerequisites

- Node 18+ (the validate lookup uses global `fetch`)

## One-time setup

`api/local.settings.json` is gitignored, so it doesn't come with the clone —
create it from the template and fill in the real key:

```powershell
cp api/local.settings.json.template api/local.settings.json
```

Edit `api/local.settings.json` and replace `<function-key-here>` with the
real `CERT_VALIDATE_KEY`. Get that key out-of-band (Teams DM, password
manager, whatever) — never put it in the repo. The `CERT_VALIDATE_URL` in
the template is already correct.

## Running locally

```powershell
npm install
npm run dev
```

Open the URL Vite prints (`http://localhost:59637` by default) and search an
ID number. Vite's dev server handles `/api/validate` itself (see
`vite.config.js`), reading `api/local.settings.json` directly and calling
the real cert-validation service — no separate process needed.

`api/validate/` is still a real Azure Function (used once this is deployed).
It shares its logic with Vite's dev shortcut via `api/validate/handler.js`,
so there's one implementation either way. If you want to test the actual
Azure Functions runtime itself (not just the shared logic), install
[Azure Functions Core Tools v4](https://learn.microsoft.com/azure/azure-functions/functions-run-local)
and run `func start` from `api/` — it serves the same function on
`http://localhost:7071/api/validate`, separately from `npm run dev`.

## Troubleshooting

- **`502 Could not reach the validation service`** — the key or URL in
  `api/local.settings.json` is wrong.
- **Search returns nothing at all** — Vite may have grabbed a different port
  because 59637 was already in use; check the port it actually printed.

## Deploying

Set `CERT_VALIDATE_URL` and `CERT_VALIDATE_KEY` as application settings on
the deployed Function App (Static Web App → Configuration) — same values as
`local.settings.json`, never committed to the repo.
