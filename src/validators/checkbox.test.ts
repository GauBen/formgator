import { describe, it } from "node:test";
import assert from "../assert.js";
import { failures, succeed } from "../definitions.js";
import { checkbox } from "./checkbox.js";

describe("checkbox()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "on");

    assert.deepEqualTyped(checkbox().safeParse(data, "input"), succeed(true));
    assert.deepEqualTyped(
      checkbox().safeParse(data, "missing"),
      succeed(false),
    );
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "invalid");

    assert.deepEqualTyped(
      checkbox().safeParse(data, "input"),
      failures.invalid(),
    );
    assert.deepEqualTyped(
      checkbox({ required: true }).safeParse(data, "missing"),
      failures.required(),
    );
  });
});