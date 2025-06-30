import { describe, it } from "node:test";
import assert from "../assert.ts";
import { failParse, safeParse, succeed } from "../definitions.ts";
import { number } from "./number.ts";

describe("number()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "123");
    data.append("float", "123.456");
    data.append("precise", String(1 / 6 + 2 / 7));
    data.append("negative", "-1.5");
    data.append("small", "0.0000000015");
    data.append("weird", "0.3");
    data.append("empty", "");

    assert.deepEqualTyped(number()[safeParse](data, "input"), succeed(123));
    assert.deepEqualTyped(number({ step: 0 })[safeParse](data, "float"), succeed(123.456));
    assert.deepEqualTyped(number()[safeParse](data, "empty"), succeed(null));
    assert.deepEqualTyped(number({ min: 123 })[safeParse](data, "input"), succeed(123));
    assert.deepEqualTyped(number({ max: 123 })[safeParse](data, "input"), succeed(123));
    assert.deepEqualTyped(number({ step: 3 })[safeParse](data, "input"), succeed(123));
    assert.deepEqualTyped(number({ min: 77, step: 23 })[safeParse](data, "input"), succeed(123));

    // Floating point arithmetic
    assert.deepEqualTyped(number({ step: 0.1 })[safeParse](data, "input"), succeed(123));
    assert.deepEqualTyped(
      number({ min: 122.956, step: 0.5 })[safeParse](data, "float"),
      succeed(123.456),
    );
    assert.deepEqualTyped(
      number({ min: 1 / 6, step: 1 / 7 })[safeParse](data, "precise"),
      succeed(1 / 6 + 2 / 7),
    );
    assert.deepEqualTyped(
      number({ min: -10, max: 0, step: 1 / 6 })[safeParse](data, "negative"),
      succeed(-1.5),
    );
    assert.deepEqualTyped(number({ step: 1e-10 })[safeParse](data, "small"), succeed(1.5e-9));
    assert.deepEqualTyped(
      number({ min: 0, max: 1, step: 0.1 })[safeParse](data, "weird"),
      succeed(0.3),
    );
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "invalid");
    data.append("empty", "");
    data.append("ok", "123");

    assert.deepEqualTyped(number()[safeParse](data, "missing"), failParse("type", {}));
    assert.deepEqualTyped(
      number({ required: true })[safeParse](data, "empty"),
      failParse("required", {}),
    );
    assert.deepEqualTyped(number()[safeParse](data, "input"), failParse("invalid", {}));
    assert.deepEqualTyped(
      number({ min: 124 })[safeParse](data, "ok"),
      failParse("min", {}, { min: 124 }),
    );
    assert.deepEqualTyped(
      number({ max: 122 })[safeParse](data, "ok"),
      failParse("max", {}, { max: 122 }),
    );
    assert.deepEqualTyped(
      number({ step: 2 })[safeParse](data, "ok"),
      failParse("step", {}, { step: 2 }),
    );
  });
});
