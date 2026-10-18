import test from 'node:test';
import assert from 'node:assert/strict';
import { getTripRouteMapPoints, getTripRouteStops } from '../src/utils/tripRoute.mjs';

test('trip route preserves itinerary order and uses saved city coordinates', () => {
  const stops = getTripRouteStops({
    itinerary: {
      cities: [
        { city_name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, nights: 2 },
        { city_name: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964, nights: 3 },
      ],
    },
  });

  assert.deepEqual(stops.map(({ name }) => name), ['Paris', 'Rome']);
  assert.deepEqual(stops.map(({ coordinates }) => coordinates), [[48.8566, 2.3522], [41.9028, 12.4964]]);
  assert.deepEqual(stops.map(({ nights }) => nights), [2, 3]);
  assert.equal(getTripRouteMapPoints(stops).length, 2);
});

test('trip route uses curated verified coordinates for known Indian itinerary cities', () => {
  const stops = getTripRouteStops({
    itinerary: {
      cities: [
        { city_name: 'Delhi', country: 'India', nights: 1 },
        { city_name: 'Agra', country: 'India', nights: 2 },
      ],
    },
  });

  assert.deepEqual(stops.map(({ coordinates }) => coordinates), [[28.6139, 77.209], [27.1767, 78.0081]]);
});

test('trip route keeps unknown stops but does not guess their map coordinates', () => {
  const stops = getTripRouteStops({
    itinerary: {
      cities: [
        { city_name: 'Example City', country: 'Exampleland' },
        { city_name: 'Known City', country: 'India' },
      ],
    },
  });

  assert.deepEqual(stops.map(({ coordinates }) => coordinates), [null, null]);
  assert.deepEqual(getTripRouteMapPoints(stops), []);
});

test('trip route rejects invalid coordinates, single stops, and routes crossing the dateline', () => {
  const invalid = getTripRouteStops({
    itinerary: {
      cities: [
        { city_name: 'A', lat: 120, lon: 10 },
        { city_name: 'B', lat: 30, lon: 20 },
      ],
    },
  });
  assert.deepEqual(invalid.map(({ coordinates }) => coordinates), [null, [30, 20]]);
  assert.deepEqual(getTripRouteMapPoints(invalid), []);

  const missingCoordinates = getTripRouteStops({
    itinerary: {
      cities: [
        { city_name: 'A', lat: 0, lon: 0 },
        { city_name: 'B', lat: null, lon: null },
      ],
    },
  });
  assert.deepEqual(missingCoordinates.map(({ coordinates }) => coordinates), [null, null]);

  const dateline = getTripRouteStops({
    itinerary: {
      cities: [
        { city_name: 'A', lat: 10, lon: 170 },
        { city_name: 'B', lat: 10, lon: -170 },
      ],
    },
  });
  assert.deepEqual(getTripRouteMapPoints(dateline), []);
});

test('trip route falls back to one destination stop when no itinerary cities are available', () => {
  const stops = getTripRouteStops({ destination: 'Jaipur', country: 'India' });

  assert.equal(stops.length, 1);
  assert.equal(stops[0].name, 'Jaipur');
  assert.deepEqual(stops[0].coordinates, [26.9124, 75.7873]);
  assert.deepEqual(getTripRouteMapPoints(stops), []);
});
