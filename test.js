'use strict';

const test = require('tape');
const rateLimit = require('.');

// promise tests

test('returns a promise', (t) => {
  const rateLimited = rateLimit(10, 100, () => Promise.resolve());
  t.ok(rateLimited() instanceof Promise);
  t.end();
});

test('passes through arguments', (t) => {
  const rateLimited = rateLimit(10, 100, resolveArguments);
  rateLimited('a', 'b', 'c').then((res) => {
    t.deepEqual(res, ['a', 'b', 'c']);
    t.end();
  });

  function resolveArguments() {
    return Promise.resolve([].slice.call(arguments));
  }
});

test('preserves function context', (t) => {
  const context = {
    resolve() {
      return Promise.resolve(this);
    }
  };

  const rateLimited = rateLimit(10, 100, context.resolve.bind(context));
  rateLimited().then((res) => {
    t.equal(res, context);
    t.end();
  });
});
