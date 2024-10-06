import { describe, it } from "node:test";
import assert from "../assert.js";
import { failures, succeed } from "../definitions.js";
import { number } from "./number.js";

describe("number()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "123");
    data.append("float", "123.456");
    data.append("empty", "");

    assert.deepEqualTyped(number().safeParse(data, "input"), succeed(123));
    assert.deepEqualTyped(
      number({ step: 0 }).safeParse(data, "float"),
      succeed(123.456),
    );
    assert.deepEqualTyped(number().safeParse(data, "empty"), succeed(null));
    assert.deepEqualTyped(
      number({ min: 123 }).safeParse(data, "input"),
      succeed(123),
    );
    assert.deepEqualTyped(
      number({ max: 123 }).safeParse(data, "input"),
      succeed(123),
    );
    assert.deepEqualTyped(
      number({ step: 3 }).safeParse(data, "input"),
      succeed(123),
    );
    assert.deepEqualTyped(
      number({ min: 77, step: 23 }).safeParse(data, "input"),
      succeed(123),
    );
    assert.deepEqualTyped(
      number({ min: 122.956, step: 0.5 }).safeParse(data, "float"),
      succeed(123.456),
    );
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "invalid");
    data.append("empty", "");
    data.append("ok", "123");

    assert.deepEqualTyped(number().safeParse(data, "missing"), failures.type());
    assert.deepEqualTyped(
      number({ required: true }).safeParse(data, "empty"),
      failures.required(),
    );
    assert.deepEqualTyped(
      number().safeParse(data, "input"),
      failures.invalid(),
    );
    assert.deepEqualTyped(
      number({ min: 124 }).safeParse(data, "ok"),
      failures.min(124),
    );
    assert.deepEqualTyped(
      number({ max: 122 }).safeParse(data, "ok"),
      failures.max(122),
    );
    assert.deepEqualTyped(
      number({ step: 2 }).safeParse(data, "ok"),
      failures.step(2),
    );
  });
});
