import { describe, it } from "node:test";
import assert from "../assert.ts";
import { failParse, safeParse, succeed } from "../definitions.ts";
import { week } from "./week.ts";

describe("week()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "2024-W40");
    data.append("empty", "");
    assert.deepEqualTyped(
      week({ required: true })[safeParse](data, "input"),
      succeed<`${number}-W${number}`>("2024-W40"),
    );
    assert.deepEqualTyped(week()[safeParse](data, "empty"), succeed(null));
    assert.deepEqualTyped(
      week({ min: "2024-W40" })[safeParse](data, "input"),
      succeed<`${number}-W${number}`>("2024-W40"),
    );
    assert.deepEqualTyped(
      week({ max: "2024-W40" })[safeParse](data, "input"),
      succeed<`${number}-W${number}`>("2024-W40"),
    );
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "invalid");
    data.append("empty", "");
    data.append("nad", "2024-W00");
    data.append("ok", "2024-W40");

    assert.deepEqualTyped(week()[safeParse](data, "missing"), failParse("type", {}));
    assert.deepEqualTyped(
      week({ required: true })[safeParse](data, "empty"),
      failParse("required", {}),
    );
    assert.deepEqualTyped(week()[safeParse](data, "input"), failParse("invalid", {}));
    assert.deepEqualTyped(week()[safeParse](data, "nad"), failParse("invalid", {}));
    assert.deepEqualTyped(
      week({ min: "2024-W41" })[safeParse](data, "ok"),
      failParse("min", {}, { min: "2024-W41" }),
    );
    assert.deepEqualTyped(
      week({ max: "2024-W39" })[safeParse](data, "ok"),
      failParse("max", {}, { max: "2024-W39" }),
    );
  });
});
