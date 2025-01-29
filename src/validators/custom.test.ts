import { describe, it } from "node:test";
import assert from "../assert.ts";
import { failures, safeParse, succeed } from "../definitions.ts";
import { custom } from "./custom.ts";

describe("custom()", async () => {
  const validator = custom((data, name) => {
    const output = data.getAll(name);
    if (!output.every((value) => typeof value === "string")) throw "Invalid value type";
    if (output.length % 2 !== 0) throw new Error("Odd number of values");
    return output;
  })[safeParse];

  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "one");
    data.append("input", "two");

    assert.deepEqualTyped(validator(data, "input"), succeed(["one", "two"]));
    assert.deepEqualTyped(validator(data, "missing"), succeed([]));
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "invalid");
    data.append("file", new File([], "file.txt"));

    assert.deepEqualTyped(validator(data, "input"), failures.custom("Odd number of values"));
    assert.deepEqualTyped(validator(data, "file"), failures.custom("Invalid value type"));
  });
});
