import { describe, it } from "node:test";
import assert from "../assert.js";
import { failures, safeParse, succeed } from "../definitions.js";
import { text } from "./text.js";

describe("text()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "hello world!");
    data.append("trim", "  hello ");
    data.append("empty", "");

    assert.deepEqualTyped(
      text()[safeParse](data, "input"),
      succeed("hello world!"),
    );
    assert.deepEqualTyped(
      text({ minlength: 12 })[safeParse](data, "input"),
      succeed("hello world!"),
    );
    assert.deepEqualTyped(
      text({ maxlength: 12 })[safeParse](data, "input"),
      succeed("hello world!"),
    );
    assert.deepEqualTyped(
      text({ pattern: /^\w+ \w+!$/u })[safeParse](data, "input"),
      succeed("hello world!"),
    );
    assert.deepEqualTyped(
      text().trim()[safeParse](data, "trim"),
      succeed("hello"),
    );
    assert.deepEqualTyped(text().trim()[safeParse](data, "empty"), succeed(""));
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "new\nline");
    data.append("empty", "");
    data.append("ok", "hello world!");

    assert.deepEqualTyped(text()[safeParse](data, "input"), failures.invalid());
    assert.deepEqualTyped(text()[safeParse](data, "missing"), failures.type());
    assert.deepEqualTyped(
      text({ required: true })[safeParse](data, "empty"),
      failures.required(),
    );
    assert.deepEqualTyped(
      text({ minlength: 13 })[safeParse](data, "ok"),
      failures.minlength(13),
    );
    assert.deepEqualTyped(
      text({ maxlength: 11 })[safeParse](data, "ok"),
      failures.maxlength(11),
    );
    assert.deepEqualTyped(
      text({ pattern: /^\w+ \w+\?$/u })[safeParse](data, "ok"),
      failures.pattern(/^\w+ \w+\?$/u),
    );
  });
});
