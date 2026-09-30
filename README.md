# Playwright Demo - DemoBlaze Automation

Automation demo for [DemoBlaze](https://www.demoblaze.com/), covering login and order workflows.

* Built with `Playwright + TypeScript`, covering UI and API testing.
* UI tests follow the Page Object Model, with page objects under `pages/` and reusable modal components under `components/`.
* Shared fixtures in `fixtures/base-test.ts` provide logging and a worker-scoped API client.
* Test specs are organized under `tests/ui` and `tests/api`, with test data colocated with each spec.
* Chromium and Firefox tests run in parallel, with test execution filtered using `@smoke` and `@regression` tags.

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
├── pages/                            # Page Objects
├── components/                       # Component Objects
├── api/                              # DemoblazeClient - thin wrapper over the site's API
├── fixtures/
│   └── base-test.ts                  # Base test with shared fixtures: log, apiClient
├── utils/                            # For helper utils. e.g. loginViaApi helper, etc
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
npx playwright test --grep @TC-013                      # one case, by its sheet ID
npm run test:ui                                         # UI specs only
npm run test:api                                        # API specs only
npm run test:report                                     # open the last HTML report
HEADLESS=false npx playwright test --project=chromium   # override any config default via env var
```

## CI

`.github/workflows/tests.yml`:

- **On every pull request:** `@smoke` tests across chromium/firefox.
- **Nightly (and manual `workflow_dispatch`):** full `@regression` set across the same 2 browsers.
- The HTML report is uploaded as a build artifact on every run.
