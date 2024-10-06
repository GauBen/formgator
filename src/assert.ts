import assert from "node:assert/strict";

declare module "assert" {
  function equalTyped<T>(
    actual: T,
    expected: T,
    message?: string | Error,
  ): asserts actual is T;
  function deepEqualTyped<T>(
    actual: T,
    expected: T,
    message?: string | Error,
  ): asserts actual is T;
}

assert.equalTyped = function (actual, expected, message) {
  return this.equal(actual, expected, message);
};

assert.deepEqualTyped = function (actual, expected, message) {
  return this.deepEqual(actual, expected, message);
};

/** A re-export of "node:assert/strict" with an additional typed methods. */
export default assert;
