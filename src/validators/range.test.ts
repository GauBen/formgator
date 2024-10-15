import { describe, it } from "node:test";
import assert from "../assert.js";
import { failures, safeParse, succeed } from "../definitions.js";
import { range } from "./range.js";

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

    assert.deepEqualTyped(range()[safeParse](data, "low"), failures.min(0));
    assert.deepEqualTyped(range()[safeParse](data, "high"), failures.max(100));
    assert.deepEqualTyped(range()[safeParse](data, "float"), failures.step(1));
  });
});
