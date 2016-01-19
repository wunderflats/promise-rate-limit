/* global test */
'use strict';

const assert = require('assert');
const after = require('after');
const rateLimit = require('./');

test('should only allow one call per interval', function (done) {
  const start = Date.now();

  // time that passes is 400ms since the first call executes immediate
  const expected = [0, 100, 200, 300, 400];
  const offsets = [];

  const trigger = after(5, function() {
    fuzzy_compare(expected, offsets);
    done();
  });

  const fn = rateLimit(1, 100, function() {
    offsets.push(Date.now() - start);
    trigger();
  });

  for (let i = 0; i < 5; ++i) {
    fn(i);
  }
});

test('should allow for calls to burst', function (done) {
  const start = Date.now();
  const expected = [0, 0, 100, 100, 200];
  const offsets = [];

  // time that passes is 400ms since the first call executes immediate
  const trigger = after(5, function() {
    fuzzy_compare(expected, offsets);
    done();
  });

  const fn = rateLimit(2, 100, function() {
    offsets.push(Date.now() - start);
    trigger();
  });

  for (let i = 0; i < 5; ++i) {
    fn(i);
  }
});

test('should preserve function context', function (done) {
  const start = Date.now();

  // time that passes is 400ms since the first call executes immediate
  const expected = [0, 100, 200, 300, 400];
  const offsets = [];

  const trigger = after(5, function() {
    fuzzy_compare(expected, offsets);
    done();
  });

  const fn = rateLimit(1, 100, function() {
    assert(this.foo === 'bar');
    offsets.push(Date.now() - start);
    trigger();
  });

  for (let i = 0; i < 5; ++i) {
    fn.call({ foo: 'bar' }, i);
  }
});

function fuzzy_compare(expected, actual) {
  assert.equal(expected.length, actual.length);

  expected.forEach(function(expected_value, idx) {
    const actual_val = actual[idx];

    const diff = Math.abs(expected_value - actual_val);
    if (diff > 20) {
      throw new Error('actual and expected values differ too much: actual ' + actual_val + ' != ' + expected_value);
    }
  });
}
