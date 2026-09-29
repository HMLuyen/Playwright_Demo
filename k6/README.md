# k6 load test

`login-load-test.js` is a small API-level load check against `/login` and `/entries`. It is
separate from the Playwright suite: k6 runs its own JS engine and cannot import anything from
`node_modules` or the rest of this repo (local relative imports like `./login-load-test.testdata.js`
still work fine).

**Before running:** the fixed account in `login-load-test.testdata.js` (`testUserK6`) must already
be signed up on the real site — there's no signup step in the script. Create it once:

```bash
curl -s -X POST https://api.demoblaze.com/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testUserK6","password":"'"$(echo -n 'DemoPass123!' | base64)"'"}'
```

## Install

```bash
brew install k6          # macOS
# or see https://k6.io/docs/get-started/installation/ for other platforms
```

## Run

```bash
k6 run k6/login-load-test.js
```

Override defaults (2 VUs, 10s) at the CLI:

```bash
k6 run -e VUS=10 -e DURATION=60s k6/login-load-test.js
```

Point at a different environment:

```bash
k6 run -e API_URL=https://api.demoblaze.com k6/login-load-test.js
```

## CI artifact

CI runs this on manual `workflow_dispatch` only (not on every PR, not on a schedule — see
`.github/workflows/tests.yml`) and exports a summary:

```bash
k6 run --summary-export=k6-summary.json k6/login-load-test.js
```

## Reading the output

- `http_req_failed` — should stay under 5% (configured threshold).
- `http_req_duration p(95)` — should stay under 2000ms (configured threshold).
- A threshold failure means k6 exits non-zero, which fails the CI job.
