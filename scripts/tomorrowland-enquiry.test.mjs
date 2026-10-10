import test from 'node:test';
import assert from 'node:assert/strict';
import { createTomorrowlandWhatsAppUrl } from '../public/tomorrowland-enquiry.js';

test('creates a WhatsApp message from only the selected trip details', () => {
  const url = new URL(createTomorrowlandWhatsAppUrl({
    destination: 'Thailand',
    whatsappNumber: '919511446642',
    departureCity: 'Mumbai',
    travelMonth: '2026-12',
    travellers: '4',
  }));
  const message = url.searchParams.get('text');

  assert.equal(url.hostname, 'wa.me');
  assert.equal(url.pathname, '/919511446642');
  assert.match(message, /Tomorrowland Thailand travel options from India/);
  assert.match(message, /Departure city: Mumbai/);
  assert.match(message, /Preferred travel month: 2026-12/);
  assert.match(message, /Travellers: 4/);
  assert.doesNotMatch(message, /@|\+91|phone|email/i);
});

test('permits a partially completed enquiry', () => {
  const url = new URL(createTomorrowlandWhatsAppUrl({
    destination: 'Winter',
    whatsappNumber: '919511446642',
  }));
  const message = url.searchParams.get('text');

  assert.match(message, /Tomorrowland Winter travel options from India/);
  assert.doesNotMatch(message, /Departure city:|Preferred travel month:|Travellers:/);
});

test('rejects invalid traveller counts instead of silently preparing a misleading enquiry', () => {
  assert.throws(() => createTomorrowlandWhatsAppUrl({
    destination: 'Winter',
    whatsappNumber: '919511446642',
    travellers: '41',
  }), /whole number from 1 to 40/);
});

test('rejects unsupported destinations and invalid contact numbers', () => {
  assert.throws(() => createTomorrowlandWhatsAppUrl({
    destination: 'Unknown',
    whatsappNumber: '919511446642',
  }), /supported Tomorrowland destination/);
  assert.throws(() => createTomorrowlandWhatsAppUrl({
    destination: 'Belgium',
    whatsappNumber: '+91 9511446642',
  }), /valid WhatsApp contact number/);
});

test('removes control characters and caps copied departure text', () => {
  const url = new URL(createTomorrowlandWhatsAppUrl({
    destination: 'Belgium',
    whatsappNumber: '919511446642',
    departureCity: `${'A'.repeat(100)}\nemail@example.com`,
  }));
  const message = url.searchParams.get('text');
  const cityLine = message.split('\n').find((line) => line.startsWith('Departure city:'));

  assert.equal(cityLine.length, 'Departure city: '.length + 80);
  assert.doesNotMatch(message, /\nemail@example\.com/);
});
