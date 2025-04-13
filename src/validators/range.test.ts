import { describe, it } from "node:test";
import assert from "../assert.ts";
import { failParse, safeParse, succeed } from "../definitions.ts";
import { range } from "./range.ts";

describe("range()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "12");

    assert.deepEqualTyped(range()[safeParse](data, "input"), succeed(12));
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("low", "-1");
    data.append("high", "101");
    data.append("float", "1.5");

    assert.deepEqualTyped(range()[safeParse](data, "low"), failParse("min", {}, { min: 0 }));
    assert.deepEqualTyped(range()[safeParse](data, "high"), failParse("max", {}, { max: 100 }));
    assert.deepEqualTyped(range()[safeParse](data, "float"), failParse("step", {}, { step: 1 }));
  });
});
