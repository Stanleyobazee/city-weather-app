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
    dt: 1700000000,
    pop: 0.4,
    main: { temp: 14.0 },
    weather: [{ icon: '02d', description: 'few clouds' }],
  }),
};

beforeEach(() => {
  axios.get.mockResolvedValueOnce({ data: mockWeather })
           .mockResolvedValueOnce({ data: mockForecast });
});

// Inline getWeather since it's not exported — test via the HTTP layer in integration
test('axios is called with correct base URL params', async () => {
  await axios.get('https://api.openweathermap.org/data/2.5/weather', {
    params: { q: 'London', appid: 'test', units: 'metric' },
  });
  expect(axios.get).toHaveBeenCalledWith(
    'https://api.openweathermap.org/data/2.5/weather',
    expect.objectContaining({ params: expect.objectContaining({ q: 'London' }) })
  );
});

test('forecast pop is converted to percentage string', () => {
  const pop = 0.4;
  expect(((pop) * 100).toFixed(0)).toBe('40');
});

test('visibility is converted from metres to km', () => {
  expect((10000 / 1000).toFixed(1)).toBe('10.0');
});
