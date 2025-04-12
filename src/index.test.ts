import { describe, it } from "node:test";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import assert from "./assert.ts";
import { type ReadonlyFormData, fail, failParse } from "./definitions.ts";
import * as fg from "./index.ts";

describe("form()", () => {
  describe(".safeParse()", () => {
    it("should support FormData", () => {
      const data = new FormData();
      data.append("input", "hello world!");

      const result = fg.form({ input: fg.text() }).safeParse(data);

      assert(result.success);
      assert.equalTyped(result.data.input, "hello world!");
    });

    it("should support URLSearchParams", () => {
      const data = new URLSearchParams("?input=hello+world!");

      const result = fg.form({ input: fg.text() }).safeParse(data);

      assert(result.success);
      assert.equalTyped(result.data.input, "hello world!");
    });

    it("should refuse invalid inputs", () => {
      const data = new FormData();
      data.append("input", "hello world!");

      const result = fg.form({ input: fg.text({ maxlength: 10 }) }).safeParse(data);

      assert(!result.success);
      assert.deepEqualTyped(
        fail(result.error.issues.input),
        failParse("maxlength", {}, { maxlength: 10 }),
      );
    });
  });

  describe(".parse()", () => {
    it("should accept valid inputs", () => {
      const data = new FormData();
      data.append("input", "hello world!");

      const result = fg.form({ input: fg.text() }).parse(data);

      assert.equalTyped(result.input, "hello world!");
    });

    it("should throw on invalid inputs", () => {
      const data = new FormData();
      data.append("input", "hello world!");

      try {
        fg.form({ input: fg.text({ maxlength: 10 }) }).parse(data);
        assert.fail("Expected an error");
      } catch (error) {
        assert(error instanceof fg.FormgatorError);
        assert.deepEqualTyped(
          fail(error.issues.input),
          failParse("maxlength", {}, { maxlength: 10 }),
        );
      }
    });
  });

  describe(".~standard()", () => {
    it("should accept valid inputs", () => {
      const schema = fg.form({
        text: fg.text(),
        number: fg.range(),
      }) satisfies StandardSchemaV1<ReadonlyFormData, { text: string | null; number: number }>;

      const data = new FormData();
      data.append("text", "Hello World!");
      data.append("number", "50");
      assert.deepEqualTyped(schema["~standard"].validate(data), {
        value: { text: "Hello World!", number: 50 },
      });
    });

    it("should reject invalid inputs", () => {
      const schema = fg.form({
        text: fg.text(),
        number: fg.range(),
      }) satisfies StandardSchemaV1<ReadonlyFormData, { text: string | null; number: number }>;

      const data = new FormData();
      data.append("number", "123");
      assert.deepEqualTyped(schema["~standard"].validate(data), {
        issues: [
          {
            message: "Invalid type",
            path: ["text"],
          },
          {
            message: "Too big, maximum value is 100",
            path: ["number"],
          },
        ],
      });

      assert.deepEqualTyped(schema["~standard"].validate({}), {
        issues: [
          {
            message: "value must be FormData or URLSearchParams",
          },
        ],
      });
    });
  });
});
