import { describe, it } from "node:test";
import assert from "../assert.js";
import { failures, safeParse, succeed } from "../definitions.js";
import { color } from "./color.js";

describe("color()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "#cafe99");

    assert.deepEqualTyped(color()[safeParse](data, "input"), succeed<`#${string}`>("#cafe99"));
    assert.deepEqualTyped(
      color().asRGB()[safeParse](data, "input"),
      succeed<[number, number, number]>([202, 254, 153]),
    );
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "invalid");

    assert.deepEqualTyped(color()[safeParse](data, "input"), failures.invalid());
    assert.deepEqualTyped(color()[safeParse](data, "missing"), failures.type());
  });
});
