import { describe, it } from "node:test";
import assert from "../assert.ts";
import { failures, safeParse, succeed } from "../definitions.ts";
import { email } from "./email.ts";

describe("email()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("input", "gautier@example.com");
    data.append("multiple", "gautier@example.com, gautier@example.net");
    data.append("empty", "");

    assert.deepEqualTyped(email()[safeParse](data, "input"), succeed("gautier@example.com"));
    assert.deepEqualTyped(
      email({ minlength: 19 })[safeParse](data, "input"),
      succeed("gautier@example.com"),
    );
    assert.deepEqualTyped(
      email({ maxlength: 19 })[safeParse](data, "input"),
      succeed("gautier@example.com"),
    );
    assert.deepEqualTyped(
      email({ pattern: /^.+@example\.com$/u })[safeParse](data, "input"),
      succeed("gautier@example.com"),
    );
    assert.deepEqualTyped(email()[safeParse](data, "empty"), succeed(null));
    assert.deepEqualTyped(
      email({ multiple: true })[safeParse](data, "multiple"),
      succeed(["gautier@example.com", "gautier@example.net"]),
    );
    assert.deepEqualTyped(
      email({ multiple: true, pattern: /^gautier@.+$/u })[safeParse](data, "multiple"),
      succeed(["gautier@example.com", "gautier@example.net"]),
    );
    assert.deepEqualTyped(email({ multiple: true })[safeParse](data, "empty"), succeed([]));
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input", "invalid");
    data.append("multiple", "a@b\nc@d");
    data.append("empty", "");
    data.append("ok", "gautier@example.com");

    assert.deepEqualTyped(email()[safeParse](data, "missing"), failures.type());
    assert.deepEqualTyped(email({ required: true })[safeParse](data, "empty"), failures.required());
    assert.deepEqualTyped(email()[safeParse](data, "input"), failures.invalid());
    assert.deepEqualTyped(email({ multiple: true })[safeParse](data, "input"), failures.invalid());
    assert.deepEqualTyped(
      email({ multiple: true })[safeParse](data, "multiple"),
      failures.invalid(),
    );
    assert.deepEqualTyped(email({ minlength: 20 })[safeParse](data, "ok"), failures.minlength(20));
    assert.deepEqualTyped(email({ maxlength: 18 })[safeParse](data, "ok"), failures.maxlength(18));
    assert.deepEqualTyped(
      email({ pattern: /^.+@example\.net$/u })[safeParse](data, "ok"),
      failures.pattern(/^.+@example\.net$/u),
    );
    assert.deepEqualTyped(
      email({ multiple: true, pattern: /^.+@example\.net$/u })[safeParse](data, "ok"),
      failures.pattern(/^.+@example\.net$/u),
    );
  });
});
