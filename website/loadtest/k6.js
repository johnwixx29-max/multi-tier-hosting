// Usage: k6 run -e BASE=http://YOUR-URL loadtest/k6.js
import http from 'k6/http';
import { sleep, check } from 'k6';
export const options = {
  stages: [
    { duration: '1m', target: 50 },    // warm-up
    { duration: '3m', target: 300 },   // heavy load (many users at once)
    { duration: '2m', target: 300 },   // sustain, watch scaling
    { duration: '1m', target: 0 },
  ],
  thresholds: { http_req_duration: ['p(95)<1500'], http_req_failed: ['rate<0.05'] },
};
const BASE = __ENV.BASE || 'http://localhost:5000';
export default function () {
  let r = http.get(`${BASE}/products`);
  check(r, { 'status 200': (x) => x.status === 200 });
  http.get(`${BASE}/cpu-burn?n=200000`);   // simulates real CPU work per user
  sleep(1);
}
