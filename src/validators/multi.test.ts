import { describe, it } from "node:test";
import assert from "../assert.ts";
import { fail, failParse, safeParse, succeed } from "../definitions.ts";
import { multi } from "./multi.ts";

describe("multi()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "hello world!");
    data.append("input", "  hello ");
    data.append("input", "");

    assert.deepEqualTyped(
      multi()[safeParse](data, "input"),
      succeed(["hello world!", "  hello ", ""]),
    );

    assert.deepEqualTyped(
      multi({ min: 3, max: 3 })[safeParse](data, "input"),
      succeed(["hello world!", "  hello ", ""]),
    );

    assert.deepEqualTyped(
      multi()
        .map((value) => value.trim())
        [safeParse](data, "input"),
      succeed(["hello world!", "hello", ""]),
    );

    assert.deepEqualTyped(
      multi()
        .map((value) => value.length)
        [safeParse](data, "input"),
      succeed([12, 8, 0]),
    );

    assert.deepEqualTyped(multi()[safeParse](data, "missing"), succeed([]));
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "hello world!");
    data.append("input", "123");
    data.append("input", "");
    data.append("file", new File(["hmm"], "file.txt"));

    assert.deepEqualTyped(multi()[safeParse](data, "file"), failParse("type", {}));
    assert.deepEqualTyped(
      multi({ min: 4 })[safeParse](data, "input"),
      failParse("minlength", {}, { minlength: 4 }),
    );
    assert.deepEqualTyped(
      multi({ max: 2 })[safeParse](data, "input"),
      failParse("maxlength", {}, { maxlength: 2 }),
    );
    assert.deepEqualTyped(
      multi()
        .map(
          () => {
            throw new Error("Custom error");
          },
          (error) => (error as Error).message,
        )
        [safeParse](data, "input"),
      fail({ code: "transform" as const, message: "Custom error" }),
    );
  });
});
