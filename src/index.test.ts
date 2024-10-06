import { describe, it } from "node:test";
import assert from "./assert.js";
import { fail, failures } from "./definitions.js";
import * as fg from "./index.js";

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

      const result = fg
        .form({ input: fg.text({ maxlength: 10 }) })
        .safeParse(data);

      assert(!result.success);
      assert.deepEqualTyped(
        fail(result.error.issues.input),
        failures.maxlength(10),
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
        assert.deepEqualTyped(fail(error.issues.input), failures.maxlength(10));
      }
    });
  });
});
