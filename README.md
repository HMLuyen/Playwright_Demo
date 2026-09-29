# Playwright Demo — DemoBlaze Automation

Automation demo for [DemoBlaze](https://www.demoblaze.com/), covering exactly the brief:

- Logging in with valid credentials
- Adding a product to the cart, then placing an order

Built with Playwright + TypeScript. See [`PLAN.md`](PLAN.md) for the full design plan, including
every site behavior verified live against the real site before any code was written.

## Framework structure

```
├── tests/
│   ├── ui/
│   │   ├── login.spec.ts        # Login — constructs its own page objects per test
│   │   ├── login.testdata.ts    # fixed, pre-existing account for login.spec.ts only
│   │   ├── order.spec.ts        # Add to cart + Place Order, own beforeEach login
│   │   └── order.testdata.ts    # product data + fixed account for order.spec.ts only
│   ├── api/
│   │   ├── login.api.spec.ts    # Login API tests
│   │   └── testdata.ts          # fixed shared API test account
│   └── perf/        # Browser-level navigation-timing budget check
├── pages/           # Page Object Model — one class per page/modal
├── api/             # DemoblazeClient — thin wrapper over the site's API
├── fixtures/
│   ├── ui-fixtures.ts   # just workerApiClient — no page objects, no account
│   └── api-fixtures.ts  # single fixed account, apiClient
├── utils/           # dialog handling, env config, login-via-API helper, username generator
├── k6/              # Standalone k6 load test (separate tool, separate runtime)
├── test-cases/      # cases.json (source of truth, all 19 cases) + generated .xlsx sheet
└── .github/workflows/tests.yml
```

**Why this shape:**

- **Page Object Model** (`pages/`) isolates selectors from test logic — a selector change touches
  one file, not every spec.
- **Page objects are constructed inside each test, not injected via fixture.** Wiring every POM
  into a shared fixture doesn't scale as more spec files get added — each spec just does
  `new CartPage(page)` for what it actually needs.
- **No shared login fixture.** `login.spec.ts` and `order.spec.ts` each use their own fixed,
  pre-existing account (`tests/ui/login.testdata.ts`, `tests/ui/order.testdata.ts`) — no signup
  step, no per-worker generated username. `order.spec.ts`'s `beforeEach` logs in via
  `utils/auth.ts`'s `loginViaApi()` (API login + cookie injection), reusing the worker-scoped
  `workerApiClient` from `ui-fixtures.ts`. A future spec needing its own distinct user just adds
  its own `testdata.ts` + `beforeEach` — it's never forced to share another spec's account.
- **Test data lives next to the spec that uses it** (`tests/ui/*.testdata.ts`,
  `tests/api/testdata.ts`), not a shared `data/` folder or `.env` — keeps each suite's data
  self-contained as more specs get added later.
- **`k6/`** lives outside `tests/` deliberately — it's a separate runtime (its own JS engine, no
  `node_modules` access) and Playwright's test runner would otherwise try to pick it up as a spec.
- **`test-cases/cases.json`** documents all 19 cases (functional/edge/negative) even though only
  11 are automated — the rest (signup flows, standalone cart checks) are out of the literal brief's
  scope but kept as documented, reviewable test-case coverage. The `.xlsx` is generated from it.
  Every automated spec's test title starts with the matching ID (e.g. `TC-ORDER-005: ...`), so
  `npx playwright test --grep TC-ORDER-005` runs one case straight from the sheet.

## Setup

```bash
git clone git@github.com:HMLuyen/Playwright_Demo.git
cd Playwright_Demo
npm install
npx playwright install --with-deps
```

Config (`BASE_URL`, `API_URL`, `WORKERS`, `RETRIES`, `HEADLESS`) has working defaults in `utils/env.ts`/`playwright.config.ts`, and overrides via real environment variables (shell or CI).

**Before running the UI suite:** the fixed accounts in `tests/ui/login.testdata.ts`
(`testUserLogin`) and `tests/ui/order.testdata.ts` (`testUserOrder`) must already be signed up on
the real site — there's no signup step in the test code. Create them once, e.g.:

```bash
curl -s -X POST https://api.demoblaze.com/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testUserLogin","password":"'"$(echo -n 'DemoPass123!' | base64)"'"}'
# repeat with "testUserOrder"
```

## Run commands

```bash
npx playwright test                                   # full suite, all 5 projects
npx playwright test --project=firefox                 # one browser project
npx playwright test --grep @smoke                      # fast subset (PR gate)
npx playwright test --grep @regression                 # full regression set (nightly)
npx playwright test --grep TC-ORDER-005                 # one case, by its sheet ID
npm run test:ui                                         # UI specs only
npm run test:api                                        # API specs only
npm run test:perf                                        # performance spec only
npm run test:report                                      # open the last HTML report
HEADLESS=false npx playwright test --project=chromium   # override any config default via env var
```

## How to add a new test

1. Add a row to `test-cases/cases.json` with a new TC ID, following the existing shape.
2. Regenerate `test-cases/demoblaze-test-cases.xlsx` from the updated JSON.
3. If the flow needs new page interactions, add/extend a class in `pages/`.
4. If it needs new test data, add a `testdata.ts` next to the new spec file — don't add to a
   shared `data/` folder or `.env`. If it needs a logged-in user, use a fixed, pre-existing
   account in that file (no signup step) — don't reuse another spec's account.
5. Write the spec in the matching `tests/{ui,api,perf}/` folder: construct the page objects you
   need directly inside the test (`new CartPage(page)`), don't add them to the shared fixture.
   Test title starts with the TC ID from step 1.
6. Tag it `@smoke` (fast, high-value path) or `@regression` (everything else).

## Known defects

Two real DemoBlaze site defects were found and confirmed by reading the site's own JavaScript
source (not just observed behavior) — see `PLAN.md` Section 2 for the full write-up:

1. **Order confirmation date is one month behind** — `purchaseOrder()` builds the date with
   `date.getMonth()` and never adds 1 (JS months are 0-indexed). Automated as
   `TC-ORDER-006` in `tests/ui/order.spec.ts`, marked `test.fail()` so CI doesn't go red for a
   defect that isn't ours to fix — if DemoBlaze ever fixes it, the test flips to an _unexpected
   pass_, which is the signal to revisit.
2. **An order can be placed with an empty cart** — `purchaseOrder()` never checks cart length.
   Automated as `TC-ORDER-005`, same `test.fail()` treatment.

Both are tagged `@known-defect` in addition to `@regression`, so they can be filtered in or out:
`npx playwright test --grep @known-defect`.

## CI

`.github/workflows/tests.yml`:

- **On every pull request:** `@smoke` tests across chromium/firefox/webkit.
- **Nightly (and manual `workflow_dispatch`):** full `@regression` set across the same 3 browsers.
- **k6 runs on manual `workflow_dispatch` only** — it's a load test against a public third-party
  site we don't own, so it doesn't run automatically on a schedule or on PRs.
- The HTML report and k6 summary are uploaded as build artifacts on every run.

## Performance testing

Two layers, both deliberately small since DemoBlaze is public infrastructure we don't own:

- `tests/perf/navigation-timing.spec.ts` — browser-level budget check (home page
  `DOMContentLoaded` under 3s), runs as part of the normal Playwright suite.
- `k6/login-load-test.js` — API-level load check against `/login` and `/entries`. See
  [`k6/README.md`](k6/README.md) for install/run instructions. Quick start:

  ```bash
  brew install k6
  k6 run k6/login-load-test.js
  k6 run -e VUS=10 -e DURATION=60s k6/login-load-test.js   # override the defaults
  ```
