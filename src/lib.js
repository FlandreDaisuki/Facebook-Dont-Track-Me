// Thanks this bug...
// https://bugzilla.mozilla.org/show_bug.cgi?id=1508174
if (!(Symbol.iterator in new URLSearchParams().keys())) {
  URLSearchParams.prototype.entries = function*() {
    for (const kv of [...this]) {
      yield kv;
    }
  };
  URLSearchParams.prototype.keys = function *() {
    for (const kv of [...this]) {
      yield kv[0];
    }
  };
  URLSearchParams.prototype.values = function *() {
    for (const kv of [...this]) {
      yield kv[1];
    }
  };
}

// https://github.com/terkelg/zet
class Zet extends Set {
  static union(...sets) {
    return new Zet(sets.reduce((a, i) => [...a, ...i]));
  }

  static intersection(...sets) {
    sets = sets.map((s) => [...s]);
    return new Zet(sets.reduce((prev, curr) => prev.filter((x) => curr.includes(x))));
  }

  static difference(...sets) {
    if (sets.length === 1) return new Zet();
    sets = sets.map((s) => [...s]);
    return new Zet(sets.reduce((prev, curr) => prev.filter((x) => !curr.includes(x))));
  }

  static symmetricDifference(setA = new Zet(), setB = new Zet()) {
    return new Zet([...[...setA].filter((x) => !setB.has(x)), ...[...setB].filter((x) => !setA.has(x))]);
  }

  static subset(setA, setB) {
    return [...setA].every((x) => setB.has(x));
  }

  static superset(setA, setB) {
    return [...setB].every((x) => setA.has(x));
  }

  static map(set, func) {
    return new Zet([...set].map(func));
  }

  static filter(set, func) {
    return new Zet([...set].filter(func));
  }

  static reduce(set, func, initializer) {
    if (initializer === undefined) return [...set].reduce(func);
    return [...set].reduce(func, initializer);
  }

  union(...sets) {
    return Zet.union(this, ...sets);
  }

  intersection(...sets) {
    return Zet.intersection(this, ...sets);
  }

  difference(...sets) {
    return Zet.difference(this, ...sets);
  }

  symmetricDifference(other) {
    return Zet.symmetricDifference(this, other);
  }

  subset(other) {
    return Zet.subset(this, other);
  }

  superset(other) {
    return Zet.superset(this, other);
  }

  map(func) {
    return Zet.map(this, func);
  }

  filter(func) {
    return Zet.filter(this, func);
  }

  reduce(func, initializer) {
    return Zet.reduce(this, func, initializer);
  }
}

// eslint-disable-next-line no-unused-vars
class $Console {
  constructor(limit = 100, caller = console.log) {
    this.counter = 0;
    this.limit = limit;
    this.caller = caller.bind(console);
  }

  _autoClear() {
    if (this.counter > this.limit) {
      console.clear();
      this.counter = 0;
    }
    this.counter += 1;
  }

  log(...args) {
    this._autoClear();
    this.caller(...args);
  }

  diff(label, A, B) {
    let iterA = A, iterB = B;

    const get = (obj, key) => obj.get ? obj.get(key) : obj[key];

    if (iterA instanceof URLSearchParams || !(Symbol.iterator in iterA)) {
      iterA = iterA.keys ? [...iterA.keys()] : Object.keys(iterA);
    }
    if (iterB instanceof URLSearchParams || !(Symbol.iterator in iterB)) {
      iterB = iterB.keys ? [...iterB.keys()] : Object.keys(iterB);
    }

    const intersection = Zet.intersection(iterA, iterB);
    const removed = Zet.difference(iterA, intersection);
    const added = Zet.difference(iterB, intersection);

    if (!removed.size && !added.size) {
      return;
    }

    this._autoClear();

    const styledLabel = `${label} %c-${removed.size} %c+${added.size} %c=${intersection.size}`;
    console.groupCollapsed(styledLabel, 'color: red;', 'color: green;', 'color: blue;');
    for (const e of removed) {
      this.caller(`%c- ${e} %c${get(A, e)}`, 'color: #F00; font-weight: bold;', 'color: #811;');
    }
    for (const e of added) {
      this.caller(`%c+ ${e} %c${get(B, e)}`, 'color: #0F0; font-weight: bold;', 'color: #181;');
    }
    for (const e of intersection) {
      this.caller(`%c= ${e} %c${get(B, e)}`, 'color: #00F; font-weight: bold;', 'color: #118;');
    }
    console.groupEnd();
  }
}

class Rule {
  USELESS(hard) {
    return hard ? this.HARD_USELESS : this.SOFT_USELESS;
  }
  PATTERNS(hard) {
    return hard ? this.HARD_PATTERNS : this.SOFT_PATTERNS;
  }
  USEFUL(hard) {
    return hard ? this.HARD_USEFUL : this.SOFT_USEFUL;
  }
  get SOFT_USELESS() {
    return [
      'fbclid', // 元兇
    ];
  }
  get SOFT_PATTERNS() {
    return [
      /^utm_/,       // google analysis
      /^guce_/,      // yahoo advertising
      /^guccounter/, // yahoo advertising
    ];
  }
  get SOFT_USEFUL() {
    return [];
  }
  get HARD_USELESS() {
    return [
      'eid',
      'dti',
      'dpr',
      'rc',
      'comment_tracking',
      'tn-str',
      'extragetparams',
      'lst',
      'epa',
    ].concat(this.SOFT_USELESS);
  }
  get HARD_PATTERNS() {
    return [
      /^__/,
      /^hc_/,
      /^ft\[/,
      /^\w+ref/,
      /^notif_/,
      /^timeline_context_item_/,
    ].concat(this.SOFT_PATTERNS);
  }
  get HARD_USEFUL() {
    return [
      '__a',
      '__adt',
      'ref_type',
    ].concat(this.SOFT_USEFUL);
  }
}

const RULE = new Rule();

/**
 * Create an URL object accepts cross browser href/url
 *
 * @param {String|URL} url
 * @returns {URL} URLObject
 */
const createURL = (url, base) => {
  try {
    return new URL(url, base);
  } catch (error) {
    return new URL(url, document.baseURI);
  }
};

/**
 * JSON clone
 * @param {Object} obj
 * @returns {Object} cloned
 */
const cloneObject = (obj) => JSON.parse(JSON.stringify(obj));

/**
 * Give object key-value map and return before and after map
 *
 * @param {Object} bad
 * @param {{hard?: Boolean, force?: String[], forceMatch?: RegExp[]}} options
 * @returns {{bad, good}} BadGood
 */
const cleanObject = (bad, options = {}) => {
  const good = cloneObject(bad);
  options.force = options.force || [];
  options.forceMatch = options.forceMatch || [];

  const isUseful = (k) => RULE.USEFUL(options.hard).includes(k);
  const isMatch = (k) => RULE.PATTERNS(options.hard).concat(options.forceMatch).some((p) => p.test(k));
  const isUseless = (k) => RULE.USELESS(options.hard).concat(options.force).includes(k);

  for (const key of Object.keys(bad)) {
    if (!isUseful(key) && isMatch(key) || isUseless(key)) {
      delete good[key];
    }
  }

  return { bad, good };
};

/**
 * Give URLSearchParams and return before and after URLSearchParams
 *
 * @param {URLSearchParams} bad
 * @param {{hard?: Boolean}} options
 * @returns {{bad: URLSearchParams, good: URLSearchParams}} BadGood
 */
const cleanURLSearchParams = (bad, options = {}) => {
  const _bad = Object.fromEntries(bad.entries());
  const _good = cleanObject(_bad, options).good;
  const good = new URLSearchParams(_good);
  return { bad, good };
};

/**
 * Give an url string or URLObject and return before and after URLObject
 *
 * @param {URL|String} url
 * @param {String} base
 * @param {{hard?: Boolean}} options
 * @returns {{bad: URL, good: URL}} BadGood
 */
const _cleanURL = (url, base, options = {}) => {
  const good = createURL(url, base);

  good.search = cleanURLSearchParams(good.searchParams, options).good;

  return {
    bad: createURL(url, base),
    good,
  };
};

const isIgnoreURL = (url) => {
  return [
    url === '#',
    /^javascript:/i.test(url),
  ].some(Boolean);
};

const getBaseURI = (url) => {
  const u = createURL(url);
  return `${u.origin}${u.pathname}`;
};

const isFacebookRedirect = (url) => {
  return getBaseURI(url) === 'https://l.facebook.com/l.php';
};

/**
 * Give an url string and return cleaned url string
 *
 * @param {URL|String} url
 * @param {String} base
 * @param {{hard?: Boolean}} options
 * @returns {String} cleaned url string
 */
// eslint-disable-next-line no-unused-vars
const cleanURL = (url, base, options = {}) => {
  if (isIgnoreURL(url)) {
    return url;
  }

  const u = createURL(url);
  if (isFacebookRedirect(url)) {
    return cleanURL(createURL(u.searchParams.get('u')), base);
  }

  const result = _cleanURL(url, base, options);
  return result.good.toString();
};
