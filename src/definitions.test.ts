import { describe, it } from "node:test";
import * as v from "valibot";
import z from "zod";
import assert from "./assert.ts";
import { failures, safeParse, succeed } from "./definitions.ts";
import { text } from "./validators/text.ts";

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
      assert.deepEqualTyped(text().optional("")[safeParse](data, "input"), succeed(""));
    });

    it("should accept present fields", () => {
      const data = new FormData();
      data.append("input", "123");

      assert.deepEqualTyped(text().optional()[safeParse](data, "input"), succeed("123"));
    });
  });

  describe("pipe", () => {
    it("should work with Zod and Valibot", () => {
      const data = new FormData();
      data.append("input", "hello@example.com");
      data.append("invalid", "hello world!");

      const zodInput = text().pipe(z.string().email());
      assert.deepEqualTyped(zodInput[safeParse](data, "input"), succeed("hello@example.com"));
      assert.deepEqualTyped(zodInput[safeParse](data, "invalid"), failures.custom("Invalid email"));

      const valibotInput = text().pipe(v.pipe(v.string(), v.email("Invalid email")));
      assert.deepEqualTyped(valibotInput[safeParse](data, "input"), succeed("hello@example.com"));
      assert.deepEqualTyped(
        valibotInput[safeParse](data, "invalid"),
        failures.custom("Invalid email"),
      );

      // To complete the coverage, we need a case that fails before the pipe
      assert.deepEqualTyped(text().pipe(z.string())[safeParse](data, "missing"), failures.type());
    });

    it("should refuse async validators", () => {
      const data = new FormData();
      data.append("input", "hello@example.com");

      assert.throws(() => {
        text()
          .pipe({
            "~standard": {
              vendor: "test",
              version: 1,
              validate: (value) => Promise.resolve({ value }),
            },
          })
          [safeParse](data, "input");
      });
    });

    it("should fix missing errors", () => {
      const data = new FormData();
      data.append("input", "hello@example.com");

      assert.deepEqualTyped(
        text()
          .pipe({
            "~standard": {
              vendor: "test",
              version: 1,
              validate: () => ({ issues: [] }),
            },
          })
          [safeParse](data, "input"),
        failures.custom("Unknown error"),
      );

      assert.deepEqualTyped(
        text()
          .pipe({
            "~standard": {
              vendor: "test",
              version: 1,
              // @ts-expect-error Invalid type to check robustness
              validate: () => ({ issues: [null] }),
            },
          })
          [safeParse](data, "input"),
        failures.custom("Unknown error"),
      );
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
