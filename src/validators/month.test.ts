import { describe, it } from "node:test";
import assert from "../assert.ts";
import { failures, safeParse, succeed } from "../definitions.ts";
import { month } from "./month.ts";

describe("month()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "2024-09");
    data.append("empty", "");
    assert.deepEqualTyped(
      month({ required: true })[safeParse](data, "input"),
      succeed<`${number}-${number}`>("2024-09"),
    );
    assert.deepEqualTyped(month()[safeParse](data, "empty"), succeed(null));
    assert.deepEqualTyped(
      month({ min: "2024-09" })[safeParse](data, "input"),
      succeed<`${number}-${number}`>("2024-09"),
    );
    assert.deepEqualTyped(
      month({ max: "2024-09" })[safeParse](data, "input"),
      succeed<`${number}-${number}`>("2024-09"),
    );
    assert.deepEqualTyped(
      month().asNumber()[safeParse](data, "input"),
      succeed(Date.parse("2024-09")),
    );
    assert.deepEqualTyped(month().asDate()[safeParse](data, "input"), succeed(new Date("2024-09")));
    assert.deepEqualTyped(month().asNumber()[safeParse](data, "empty"), succeed(null));
    assert.deepEqualTyped(month().asDate()[safeParse](data, "empty"), succeed(null));
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "invalid");
    data.append("empty", "");
    data.append("nad", "2024-13");
    data.append("ok", "2024-09");

    assert.deepEqualTyped(month()[safeParse](data, "missing"), failures.type());
    assert.deepEqualTyped(month({ required: true })[safeParse](data, "empty"), failures.required());
    assert.deepEqualTyped(month()[safeParse](data, "input"), failures.invalid());
    assert.deepEqualTyped(month()[safeParse](data, "nad"), failures.invalid());
    assert.deepEqualTyped(
      month({ min: "2024-10" })[safeParse](data, "ok"),
      failures.min("2024-10"),
    );
    assert.deepEqualTyped(
      month({ max: "2024-08" })[safeParse](data, "ok"),
      failures.max("2024-08"),
    );
  });
});
