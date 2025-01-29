import { describe, it } from "node:test";
import assert from "../assert.ts";
import { failures, safeParse, succeed } from "../definitions.ts";
import { datetimeLocal } from "./datetimeLocal.ts";

describe("date()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "2024-09-30T22:45");
    data.append("empty", "");

    assert.deepEqualTyped(
      datetimeLocal()[safeParse](data, "input"),
      succeed<`${number}-${number}-${number}T${number}:${number}`>("2024-09-30T22:45"),
    );
    assert.deepEqualTyped(datetimeLocal()[safeParse](data, "empty"), succeed(null));
    assert.deepEqualTyped(
      datetimeLocal({
        min: "2024-09-30T22:45",
      })[safeParse](data, "input"),
      succeed<`${number}-${number}-${number}T${number}:${number}`>("2024-09-30T22:45"),
    );
    assert.deepEqualTyped(
      datetimeLocal({
        max: "2024-09-30T22:45",
      })[safeParse](data, "input"),
      succeed<`${number}-${number}-${number}T${number}:${number}`>("2024-09-30T22:45"),
    );
    assert.deepEqualTyped(
      datetimeLocal().asNumber()[safeParse](data, "input"),
      succeed(Date.parse("2024-09-30T22:45")),
    );
    assert.deepEqualTyped(
      datetimeLocal().asDate()[safeParse](data, "input"),
      succeed(new Date("2024-09-30T22:45")),
    );
    assert.deepEqualTyped(datetimeLocal().asNumber()[safeParse](data, "empty"), succeed(null));
    assert.deepEqualTyped(datetimeLocal().asDate()[safeParse](data, "empty"), succeed(null));
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "invalid");
    data.append("empty", "");
    data.append("nad", "2024-13-01T22:45");
    data.append("ok", "2024-09-30T22:45");

    assert.deepEqualTyped(datetimeLocal()[safeParse](data, "missing"), failures.type());
    assert.deepEqualTyped(
      datetimeLocal({ required: true })[safeParse](data, "empty"),
      failures.required(),
    );
    assert.deepEqualTyped(datetimeLocal()[safeParse](data, "input"), failures.invalid());
    assert.deepEqualTyped(datetimeLocal()[safeParse](data, "nad"), failures.invalid());
    assert.deepEqualTyped(
      datetimeLocal({
        min: "2024-09-30T22:46",
      })[safeParse](data, "ok"),
      failures.min("2024-09-30T22:46"),
    );
    assert.deepEqualTyped(
      datetimeLocal({
        max: "2024-09-30T22:44",
      })[safeParse](data, "ok"),
      failures.max("2024-09-30T22:44"),
    );
  });
});
