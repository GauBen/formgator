import { describe, it } from "node:test";
import assert from "../assert.js";
import { failures, succeed } from "../definitions.js";
import { select } from "./select.js";

describe("select()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "option");
    data.append("multiple", "foo");
    data.append("multiple", "bar");

    assert.deepEqualTyped(
      select(["option"]).safeParse(data, "input"),
      succeed("option" as const),
    );
    assert.deepEqualTyped(
      select(new Set(["option"])).safeParse(data, "input"),
      succeed("option" as const),
    );
    assert.deepEqualTyped(
      select((x) => x === "option").safeParse(data, "input"),
      succeed("option"),
    );

    assert.deepEqualTyped(
      select(["foo", "bar"], { multiple: true }).safeParse(data, "multiple"),
      succeed<Array<"foo" | "bar">>(["foo", "bar"]),
    );
    assert.deepEqualTyped(
      select(["foo", "bar"], { multiple: true }).safeParse(data, "missing"),
      succeed([]),
    );
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "invalid");
    data.append("empty", "");
    data.append("file", new File([], "file.txt"));

    assert.deepEqualTyped(
      select(["option"]).safeParse(data, "input"),
      failures.invalid(),
    );
    assert.deepEqualTyped(
      select(["option"], { multiple: true }).safeParse(data, "input"),
      failures.invalid(),
    );
    assert.deepEqualTyped(
      select([], { required: true }).safeParse(data, "missing"),
      failures.type(),
    );
    assert.deepEqualTyped(
      select([], { multiple: true, required: true }).safeParse(data, "missing"),
      failures.required(),
    );
    assert.deepEqualTyped(
      select([], { required: true }).safeParse(data, "empty"),
      failures.required(),
    );
    assert.deepEqualTyped(
      select([], { multiple: true }).safeParse(data, "file"),
      failures.type(),
    );
  });
});
