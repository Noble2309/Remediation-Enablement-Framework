(function () {
  'use strict';

  const STORAGE_KEY = 'remediation-enablement-demo-v1';

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function defaults() {
    return clone(window.PROTOTYPE_DATA.defaultWorkflowState);
  }

  function isPlainObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  function load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults();
      const parsed = JSON.parse(raw);
      if (!isPlainObject(parsed)) return defaults();

      const base = defaults();
      for (const id of Object.keys(base)) {
        if (!isPlainObject(parsed[id])) continue;
        const item = parsed[id];
        if (typeof item.status === 'string') base[id].status = item.status;
        if (item.acceptance === null || isPlainObject(item.acceptance)) base[id].acceptance = item.acceptance;
        if (item.retest === null || isPlainObject(item.retest)) base[id].retest = item.retest;
        if (Array.isArray(item.history)) base[id].history = item.history.slice(-30);
      }
      return base;
    } catch (error) {
      console.warn('Could not load demo state; defaults restored.', error);
      return defaults();
    }
  }

  let state = load();

  function save() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getAll() {
    return clone(state);
  }

  function getFinding(id) {
    return state[id] ? clone(state[id]) : null;
  }

  function updateFinding(id, updater) {
    if (!state[id] || typeof updater !== 'function') return false;
    const next = updater(clone(state[id]));
    if (!isPlainObject(next)) return false;
    state[id] = next;
    save();
    return true;
  }

  function reset() {
    state = defaults();
    save();
  }

  window.DemoState = {
    getAll,
    getFinding,
    updateFinding,
    reset
  };
})();
