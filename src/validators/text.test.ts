import { describe, it } from "node:test";
import assert from "../assert.ts";
import { failParse, safeParse, succeed } from "../definitions.ts";
import { text } from "./text.ts";

describe("text()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "hello world!");
    data.append("trim", "  hello ");
    data.append("empty", "");

    assert.deepEqualTyped(text()[safeParse](data, "input"), succeed("hello world!"));
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
    assert.deepEqualTyped(text().trim()[safeParse](data, "trim"), succeed("hello"));
    assert.deepEqualTyped(text().trim()[safeParse](data, "empty"), succeed(""));
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "new\nline");
    data.append("empty", "");
    data.append("ok", "hello world!");

    assert.deepEqualTyped(
      text({}, { invalid: "Nope, not valid" })[safeParse](data, "input"),
      failParse("invalid", { invalid: "Nope, not valid" }),
    );
    assert.deepEqualTyped(text()[safeParse](data, "missing"), failParse("type", {}));
    assert.deepEqualTyped(
      text({ required: true })[safeParse](data, "empty"),
      failParse("required", {}),
    );
    assert.deepEqualTyped(
      text({ minlength: 13 })[safeParse](data, "ok"),
      failParse("minlength", {}, { minlength: 13 }),
    );
    assert.deepEqualTyped(
      text({ maxlength: 11 }, { maxlength: ({ maxlength }) => `${maxlength} chars plz` })[
        safeParse
      ](data, "ok"),
      failParse("maxlength", { maxlength: "11 chars plz" }, { maxlength: 11 }),
    );
    assert.deepEqualTyped(
      text({ pattern: /^\w+ \w+\?$/u })[safeParse](data, "ok"),
      failParse("pattern", {}, { pattern: /^\w+ \w+\?$/u }),
    );
  });
});
