import { describe, it } from "node:test";
import assert from "../assert.ts";
import { failParse, safeParse, succeed } from "../definitions.ts";
import { hidden } from "./hidden.ts";

describe("hidden()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "hello world!");

    assert.deepEqualTyped(hidden()[safeParse](data, "input"), succeed("hello world!"));
  });

  it("should refuse invalid inputs", () => {
    assert.deepEqualTyped(hidden()[safeParse](new FormData(), "missing"), failParse("type", {}));
  });
});
