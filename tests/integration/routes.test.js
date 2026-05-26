const request = require('supertest');
const axios = require('axios');
jest.mock('axios');

const mockWeather = {
  name: 'London', sys: { country: 'GB', sunrise: 1700000000, sunset: 1700040000 },
  main: { temp: 15.5, feels_like: 13.2, humidity: 80, pressure: 1012 },
  weather: [{ description: 'clear sky', icon: '01d' }],
  wind: { speed: 5.1 },
  visibility: 10000,
};
const mockForecast = {
  list: Array(8).fill({
    dt: 1700000000, pop: 0.2,
    main: { temp: 14.0 },
    weather: [{ icon: '02d', description: 'few clouds' }],
  }),
};

const app = require('../../index');

beforeEach(() => {
  axios.get.mockImplementation((url) => {
    if (url.includes('forecast')) return Promise.resolve({ data: mockForecast });
    return Promise.resolve({ data: mockWeather });
  });
});

afterAll(() => app.close?.());

test('GET / returns 200 and city cards', async () => {
  const res = await request(app).get('/');
  expect(res.statusCode).toBe(200);
  expect(res.text).toContain('London');
});

test('GET /city?name=London returns 200 with weather details', async () => {
  const res = await request(app).get('/city?name=London');
  expect(res.statusCode).toBe(200);
  expect(res.text).toContain('London');
});

test('GET /city with no name redirects to /', async () => {
  const res = await request(app).get('/city');
  expect(res.statusCode).toBe(302);
  expect(res.headers.location).toBe('/');
});
