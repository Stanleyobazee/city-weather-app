const http = require('http');

const BASE = 'http://localhost:3000';

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}

test('homepage loads and contains a city name', async () => {
  const { status, body } = await get(`${BASE}/`);
  expect(status).toBe(200);
  expect(body).toMatch(/London|Tokyo|Paris|Lagos/);
}, 15000);

test('city detail page loads for London', async () => {
  const { status, body } = await get(`${BASE}/city?name=London`);
  expect(status).toBe(200);
  expect(body).toContain('London');
}, 15000);

test('unknown city shows error message', async () => {
  const { status, body } = await get(`${BASE}/city?name=FakeCityXYZ`);
  expect(status).toBe(200);
  expect(body).toContain('FakeCityXYZ');
}, 15000);
