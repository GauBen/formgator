import { describe, it } from "node:test";
import assert from "../assert.ts";
import { failParse, safeParse, succeed } from "../definitions.ts";
import { color } from "./color.ts";

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

    assert.deepEqualTyped(color()[safeParse](data, "input"), failParse("invalid", {}));
    assert.deepEqualTyped(color()[safeParse](data, "missing"), failParse("type", {}));
  });
});
