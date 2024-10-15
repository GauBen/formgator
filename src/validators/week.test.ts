import { describe, it } from "node:test";
import assert from "../assert.js";
import { failures, safeParse, succeed } from "../definitions.js";
import { week } from "./week.js";

describe("week()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "2024-W40");
    data.append("empty", "");
    assert.deepEqualTyped(
      week({ required: true })[safeParse](data, "input"),
      succeed("2024-W40"),
    );
    assert.deepEqualTyped(week()[safeParse](data, "empty"), succeed(null));
    assert.deepEqualTyped(
      week({ min: "2024-W40" })[safeParse](data, "input"),
      succeed("2024-W40"),
    );
    assert.deepEqualTyped(
      week({ max: "2024-W40" })[safeParse](data, "input"),
      succeed("2024-W40"),
    );
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "invalid");
    data.append("empty", "");
    data.append("nad", "2024-W00");
    data.append("ok", "2024-W40");

    assert.deepEqualTyped(week()[safeParse](data, "missing"), failures.type());
    assert.deepEqualTyped(
      week({ required: true })[safeParse](data, "empty"),
      failures.required(),
    );
    assert.deepEqualTyped(week()[safeParse](data, "input"), failures.invalid());
    assert.deepEqualTyped(week()[safeParse](data, "nad"), failures.invalid());
    assert.deepEqualTyped(
      week({ min: "2024-W41" })[safeParse](data, "ok"),
      failures.min("2024-W41"),
    );
    assert.deepEqualTyped(
      week({ max: "2024-W39" })[safeParse](data, "ok"),
      failures.max("2024-W39"),
    );
  });
});
