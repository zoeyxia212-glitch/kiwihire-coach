// k6 load test for the main read and write paths.
// Run against a local or deployed backend:
//   k6 run -e BASE_URL=http://localhost:8080 loadtest/applications.js
// Each virtual user registers its own account, so no shared data is needed.
// Never point this at a paid cloud environment without checking the cost first.
import http from "k6/http";
import { check, sleep } from "k6";

const BASE = __ENV.BASE_URL || "http://localhost:8080";

export const options = {
  stages: [
    { duration: "20s", target: Number(__ENV.VUS || 20) },
    { duration: "40s", target: Number(__ENV.VUS || 20) },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
};

const json = { headers: { "Content-Type": "application/json" } };

export default function () {
  const email = `load${__VU}x${Date.now()}${__ITER}@example.com`;
  const password = "LoadTest123";

  http.post(`${BASE}/api/auth/register`, JSON.stringify({ email, password }), json);
  const login = http.post(`${BASE}/api/auth/login`, JSON.stringify({ email, password }), json);
  const token = login.json("token");
  check(login, { "login ok": (r) => r.status === 200 && !!token });
  if (!token) return;

  const auth = {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  };

  const created = http.post(
    `${BASE}/api/applications`,
    JSON.stringify({
      company: "Load Test Ltd",
      roleTitle: "Graduate Developer",
      location: "Auckland",
      status: "Saved",
      jobDescription: "React, TypeScript and Java. Graduates welcome.",
      closingDate: "2027-12-31",
    }),
    auth,
  );
  check(created, { "created 201": (r) => r.status === 201 });

  const list = http.get(`${BASE}/api/applications`, auth);
  check(list, { "list 200": (r) => r.status === 200 });
  sleep(1);
}
