import { describe, it } from "node:test";
import assert from "../assert.js";
import { failures, safeParse, succeed } from "../definitions.js";
import { url } from "./url.js";

describe("url()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "http://example.com/~gautier");
    data.append("empty", "");

    assert.deepEqualTyped(url()[safeParse](data, "input"), succeed("http://example.com/~gautier"));
    assert.deepEqualTyped(
      url().asURL()[safeParse](data, "input"),
      succeed(new URL("http://example.com/~gautier")),
    );
    assert.deepEqualTyped(url()[safeParse](data, "empty"), succeed(null));
    assert.deepEqualTyped(url().asURL()[safeParse](data, "empty"), succeed(null));
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "invalid");
    data.append("empty", "");

    assert.deepEqualTyped(url()[safeParse](data, "missing"), failures.type());
    assert.deepEqualTyped(url({ required: true })[safeParse](data, "empty"), failures.required());
    assert.deepEqualTyped(url()[safeParse](data, "input"), failures.invalid());
  });
});
