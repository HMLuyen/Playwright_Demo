# Playwright Demo - DemoBlaze Automation

Automation demo for [DemoBlaze](https://www.demoblaze.com/)

Built with Playwright + TypeScript.

## Framework structure

```
├── tests/
│   ├── ui/
│   │   ├── login.spec.ts             # Test script for login
│   │   ├── login.testdata.ts         # Test data for login.spec.ts
│   │   ├── ...
│   ├── api/
│   │   ├── login.api.spec.ts         # Login API tests
│   │   └── login.api.testdata.ts     #  Test data for API test
│   │   ├── ...
│   └── perf/                         # Performent tests
├── pages/                            # Page Objects
├── components/                       # Component Objects
├── api/                              # DemoblazeClient - thin wrapper over the site's API
├── fixtures/
│   └── base-test.ts                  # Base test with shared fixtures: log, apiClient
├── utils/                            # For helper utils. e.g. login-via-API helper, username generator, etc
├── k6/                               # Standalone k6 load test (separate tool, separate runtime)
├── playwright.config.ts              # Project configuration
└── .github/workflows/tests.yml       # GitHub Action for triggering test
```

## Setup

```bash
git clone git@github.com:HMLuyen/Playwright_Demo.git
cd Playwright_Demo

# Install project dependency
npm install

# Install Playwright browser binaries
npx playwright install --with-deps
```

Config (`BASE_URL`, `API_URL`, `WORKERS`, `RETRIES`, `HEADLESS`) has working defaults in `utils/env.ts`/`playwright.config.ts`, and overrides via real environment variables (shell or CI).

## Run command examples

```bash
npx playwright test                                     # full suite, both browsers
npx playwright test --project=firefox                   # one browser project
npx playwright test --grep @smoke                       # fast subset (PR gate)
npx playwright test --grep @regression                  # full regression set (nightly)
npx playwright test --grep @TC-018                      # one case, by its sheet ID
npm run test:ui                                         # UI specs only
npm run test:api                                        # API specs only
npm run test:perf                                       # performance spec only
npm run test:report                                     # open the last HTML report
HEADLESS=false npx playwright test --project=chromium   # override any config default via env var
```

## CI

`.github/workflows/tests.yml`:

- **On every pull request:** `@smoke` tests across chromium/firefox.
- **Nightly (and manual `workflow_dispatch`):** full `@regression` set across the same 2 browsers.
- **k6 runs on manual `workflow_dispatch` only** - it's a load test against a public third-party
  site we don't own, so it doesn't run automatically on a schedule or on PRs.
- The HTML report and k6 summary are uploaded as build artifacts on every run.

## Performance testing

- `tests/perf/navigation-timing.spec.ts` - browser-level budget check (home page
  `DOMContentLoaded` under 3s), runs as part of the normal Playwright suite.
- `k6/login-load-test.js` - API-level load check against `/login` and `/entries`. See
  [`k6/README.md`](k6/README.md) for install/run instructions. Quick start:

  ```bash
  brew install k6
  k6 run k6/login-load-test.js
  k6 run -e VUS=10 -e DURATION=60s k6/login-load-test.js   # override the defaults
  ```
