const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function loadSource(file, dependencies) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(compiled, {
    module,
    exports: module.exports,
    require: name => {
      assert.ok(name in dependencies, 'Unexpected dependency: ' + name);
      return dependencies[name];
    },
    console
  }, { filename: file });
  return module.exports;
}

function fixture() {
  const events = [];
  const storage = new Map();
  const schedules = [];
  let task;
  const location = {
    Accuracy: { Balanced: 3 },
    ActivityType: { Fitness: 3 },
    getForegroundPermissionsAsync: async () => ({ status: 'granted' }),
    requestForegroundPermissionsAsync: async () => ({ status: 'granted' }),
    getBackgroundPermissionsAsync: async () => ({ status: 'granted' }),
    requestBackgroundPermissionsAsync: async () => ({ status: 'granted' }),
    hasStartedLocationUpdatesAsync: async () => true,
    stopLocationUpdatesAsync: async () => { events.push('stopped'); },
    startLocationUpdatesAsync: async () => { events.push('started'); }
  };
  const asyncStorage = {
    getItem: async key => storage.get(key) || null,
    setItem: async (key, value) => { storage.set(key, value); events.push('stored'); },
    removeItem: async key => { storage.delete(key); }
  };
  const exports = loadSource('src/services/notifications.ts', {
    'expo-notifications': { setNotificationHandler: () => {}, SchedulableTriggerInputTypes: { DAILY: 'daily' }, scheduleNotificationAsync: async value => { schedules.push(value); } },
    'expo-location': location,
    'expo-task-manager': { defineTask: (name, callback) => { task = callback; events.push('defined'); } },
    '@react-native-async-storage/async-storage': { __esModule: true, default: asyncStorage },
    'react-native': { Platform: { OS: 'android' } },
    './recommendations': {},
    '../utils/location': loadSource('src/utils/location.ts', {}),
    '../config/firebase': { db: {} },
    'firebase/firestore': { doc: (...segments) => segments, getDoc: async () => ({ exists: () => false }), setDoc: async () => {} }
  });
  return { exports, events, storage, schedules, task, location };
}

test('background tasks are registered before tracking starts and retain the active user', async () => {
  const state = fixture();
  assert.deepEqual(state.events, ['defined']);
  await state.exports.startLocationTracking('first-user');
  assert.ok(state.events.indexOf('stored') < state.events.indexOf('started'));
  assert.ok([...state.storage.values()].includes('first-user'));
  await state.exports.stopLocationTracking();
  assert.equal(state.storage.size, 0);
});

test('background tasks safely ignore errors and empty or signed-out events', async () => {
  const state = fixture();
  await state.task({ error: new Error('permission denied') });
  await state.task({ data: null });
  await state.task({ data: { locations: [] } });
  await state.task({ data: { locations: [{ coords: { latitude: 0, longitude: 0 } }] } });
  assert.equal(state.schedules.length, 0);
});

test('daily recommendations use the SDK daily notification trigger', async () => {
  const state = fixture();
  await state.exports.scheduleDailyRecommendationNotification([]);
  assert.equal(state.schedules[0].trigger.type, 'daily');
  assert.equal(state.schedules[0].trigger.hour, 11);
  assert.equal(state.schedules[0].trigger.minute, 0);
  assert.equal(state.schedules[0].trigger.repeats, undefined);
});

test('permission denial prevents persisting a user or starting background tracking', async () => {
  const state = fixture();
  state.location.getForegroundPermissionsAsync = async () => ({ status: 'denied' });
  state.location.requestForegroundPermissionsAsync = async () => ({ status: 'denied' });
  await state.exports.startLocationTracking('user');
  assert.equal(state.storage.size, 0);
  assert.ok(!state.events.includes('started'));
});

test('the application store exposes and updates its settings reducer', () => {
  const toolkit = require('@reduxjs/toolkit');
  const settings = loadSource('src/store/slices/settingsSlice.ts', { '@reduxjs/toolkit': toolkit });
  const reducer = (state = {}) => state;
  const { default: store } = loadSource('src/store/index.ts', {
    '@reduxjs/toolkit': toolkit,
    './slices/settingsSlice': settings,
    './slices/authSlice': { __esModule: true, default: reducer },
    './slices/placesSlice': { __esModule: true, default: reducer },
    './slices/favoritesSlice': { __esModule: true, default: reducer }
  });
  assert.equal(typeof store.getState().settings.notificationSettings.nearbyPlaces, 'boolean');
  store.dispatch(settings.updateNotificationSettings({ nearbyPlaces: false }));
  assert.equal(store.getState().settings.notificationSettings.nearbyPlaces, false);
});
