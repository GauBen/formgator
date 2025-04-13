import { describe, it } from "node:test";
import assert from "../assert.ts";
import { failParse, safeParse, succeed } from "../definitions.ts";
import { radio } from "./radio.ts";

describe("radio()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "option");

    assert.deepEqualTyped(radio(["option"])[safeParse](data, "input"), succeed("option" as const));
    assert.deepEqualTyped(
      radio(["option"], { required: true })[safeParse](data, "input"),
      succeed("option" as const),
    );
    assert.deepEqualTyped(radio(["option"])[safeParse](data, "missing"), succeed(null));
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "invalid");
    data.append("file", new File([], "file.txt"));

    assert.deepEqualTyped(radio([])[safeParse](data, "input"), failParse("invalid", {}));
    assert.deepEqualTyped(radio([])[safeParse](data, "file"), failParse("type", {}));
    assert.deepEqualTyped(
      radio([], { required: true })[safeParse](data, "missing"),
      failParse("required", {}),
    );
  });
});
