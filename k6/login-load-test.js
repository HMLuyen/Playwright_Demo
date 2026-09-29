import http from 'k6/http';
import encoding from 'k6/encoding';
import { check, sleep } from 'k6';

// k6 has its own JS runtime — no node_modules, no imports from the rest of this
// repo. Settings come from __ENV, not .env.
const BASE_URL = __ENV.API_URL || 'https://api.demoblaze.com';
const VUS = __ENV.VUS ? parseInt(__ENV.VUS, 10) : 5;
const DURATION = __ENV.DURATION || '30s';

// Deliberately tiny: this proves the framework can run a load test and produce
// p95/error-rate output, not a real capacity test against a public third-party
// site we don't own.
export const options = {
  vus: VUS,
  duration: DURATION,
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};

// setup() runs once (not per-VU) — signs up a single shared account so this
// script doesn't create one account per virtual user on a public site.
export function setup() {
  const username = `pwdemo_k6_${Date.now()}`;
  const password = 'K6LoadTestPass1';
  const encodedPassword = encoding.b64encode(password);

  http.post(
    `${BASE_URL}/signup`,
    JSON.stringify({ username, password: encodedPassword }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  return { username, encodedPassword };
}

export default function (data) {
  const loginRes = http.post(
    `${BASE_URL}/login`,
    JSON.stringify({ username: data.username, password: data.encodedPassword }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  check(loginRes, {
    'login status is 200': (res) => res.status === 200,
    'login returns a token': (res) => {
      try {
        const body = res.json();
        return typeof body === 'string' && body.indexOf('Auth_token: ') === 0;
      } catch (e) {
        return false;
      }
    },
  });

  const entriesRes = http.get(`${BASE_URL}/entries`);
  check(entriesRes, {
    'entries status is 200': (res) => res.status === 200,
  });

  sleep(1);
}
