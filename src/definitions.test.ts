import { describe, it } from "node:test";
import assert from "./assert.js";
import { failures, safeParse, succeed } from "./definitions.js";
import { text } from "./validators/text.js";

describe("methods", () => {
  describe(".transform()", () => {
    it("should transform values", () => {
      const data = new FormData();
      data.append("input", "123");

      assert.deepEqualTyped(
        text({ required: true }).transform(BigInt)[safeParse](data, "input"),
        succeed(123n),
      );
    });

    it("should catch errors", () => {
      const data = new FormData();
      data.append("input", "nan");

      assert.deepEqualTyped(
        text({ required: true })
          .transform(BigInt, () => "Not a number")
          [safeParse](data, "input"),
        failures.transform("Not a number"),
      );
    });

    it("should be lazy", () => {
      const data = new FormData();
      data.append("input", "nan");

      const input = text({ required: true, pattern: /^\d+$/ }).transform(BigInt);

      assert.deepEqualTyped(input[safeParse](data, "input"), failures.pattern(/^\d+$/));
    });
  });

  describe(".refine()", () => {
    it("should accept valid predicates", () => {
      const data = new FormData();
      data.append("input", "123");

      assert.deepEqualTyped(
        text({ required: true })
          .refine((value) => value.startsWith("1"))
          [safeParse](data, "input"),
        succeed("123"),
      );
      assert.deepEqualTyped(
        text({ required: true })
          .refine((value) => value === "123")
          [safeParse](data, "input"),
        succeed("123" as const),
      );
    });

    it("should refuse invalid predicates", () => {
      const data = new FormData();
      data.append("input", "nan");

      assert.deepEqualTyped(
        text({ required: true })
          .refine((value) => value.startsWith("1"))
          [safeParse](data, "input"),
        failures.refine("nan", "Invalid value"),
      );
      assert.deepEqualTyped(
        text({ required: true })
          .refine((value) => value === "124")
          [safeParse](data, "input"),
        failures.refine("nan", "Invalid value"),
      );
    });

    it("should use custom messages", () => {
      const data = new FormData();
      data.append("input", "nan");

      assert.deepEqualTyped(
        text({ required: true })
          .refine(
            (value) => value.startsWith("1"),
            () => "Nope",
          )
          [safeParse](data, "input"),
        failures.refine("nan", "Nope"),
      );
    });

    it("should be lazy", () => {
      const data = new FormData();
      data.append("input", "nan");

      const input = text({ required: true, pattern: /^\d+$/ }).refine((value) =>
        value.startsWith("1"),
      );

      assert.deepEqualTyped(input[safeParse](data, "input"), failures.pattern(/^\d+$/));
    });
  });

  describe(".optional()", () => {
    it("should accept missing fields", () => {
      const data = new FormData();

      assert.deepEqualTyped(text().optional()[safeParse](data, "input"), succeed(undefined));
    });

    it("should accept present fields", () => {
      const data = new FormData();
      data.append("input", "123");

      assert.deepEqualTyped(text().optional()[safeParse](data, "input"), succeed("123"));
    });
  });

  it("should be composable", () => {
    const data = new FormData();
    data.append("input", "123");

    const input = text()
      .transform(Number)
      .refine((value) => value % 2 === 1)
      .transform(String);

    assert.deepEqualTyped(input[safeParse](data, "input"), succeed("123"));
  });
});
