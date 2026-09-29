import http from 'k6/http'
import encoding from 'k6/encoding'
import { check, sleep } from 'k6'
import { K6_TEST_ACCOUNT } from './login-load-test.testdata.js'

const BASE_URL = __ENV.API_URL || 'https://api.demoblaze.com'
const VUS = __ENV.VUS ? parseInt(__ENV.VUS, 10) : 2
const DURATION = __ENV.DURATION || '10s'

export const options = {
  vus: VUS,
  duration: DURATION,
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
}

export function setup() {
  return { encodedPassword: encoding.b64encode(K6_TEST_ACCOUNT.password) }
}

export default function (data) {
  const loginRes = http.post(
    `${BASE_URL}/login`,
    JSON.stringify({ username: K6_TEST_ACCOUNT.username, password: data.encodedPassword }),
    { headers: { 'Content-Type': 'application/json' } },
  )

  check(loginRes, {
    'login status is 200': (res) => res.status === 200,
    'login returns a token': (res) => {
      try {
        const body = res.json()
        return typeof body === 'string' && body.indexOf('Auth_token: ') === 0
      } catch (e) {
        return false
      }
    },
  })

  const entriesRes = http.get(`${BASE_URL}/entries`)
  check(entriesRes, {
    'entries status is 200': (res) => res.status === 200,
  })

  sleep(1)
}
