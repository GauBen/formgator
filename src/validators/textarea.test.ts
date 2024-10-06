import { describe, it } from "node:test";
import assert from "../assert.js";
import { failures, succeed } from "../definitions.js";
import { textarea } from "./textarea.js";

describe("textarea()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "hello\nworld!");
    data.append("trim", "  hello ");

    assert.deepEqualTyped(
      textarea().safeParse(data, "input"),
      succeed("hello\nworld!"),
    );
    assert.deepEqualTyped(
      textarea({ minlength: 12 }).safeParse(data, "input"),
      succeed("hello\nworld!"),
    );
    assert.deepEqualTyped(
      textarea({ maxlength: 12 }).safeParse(data, "input"),
      succeed("hello\nworld!"),
    );
    assert.deepEqualTyped(
      textarea().trim().safeParse(data, "trim"),
      succeed("hello"),
    );
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("empty", "");
    data.append("ok", "hello world!");

    assert.deepEqualTyped(
      textarea().safeParse(data, "missing"),
      failures.type(),
    );
    assert.deepEqualTyped(
      textarea({ required: true }).safeParse(data, "empty"),
      failures.required(),
    );
    assert.deepEqualTyped(
      textarea({ minlength: 13 }).safeParse(data, "ok"),
      failures.minlength(13),
    );
    assert.deepEqualTyped(
      textarea({ maxlength: 11 }).safeParse(data, "ok"),
      failures.maxlength(11),
    );
  });
});
