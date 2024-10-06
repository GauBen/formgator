import { describe, it } from "node:test";
import assert from "../assert.js";
import { failures, succeed } from "../definitions.js";
import { image } from "./image.js";

describe("image()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    data.append("x", "12");
    data.append("y", "34");
    data.append("input.x", "56");
    data.append("input.y", "78");

    assert.deepEqualTyped(
      image().safeParse(data, ""),
      succeed({ x: 12, y: 34 }),
    );
    assert.deepEqualTyped(
      image().safeParse(data, "input"),
      succeed({ x: 56, y: 78 }),
    );
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    data.append("input.x", "invalid");
    data.append("input.y", "invalid");

    assert.deepEqualTyped(image().safeParse(data, "input"), failures.invalid());
    assert.deepEqualTyped(image().safeParse(data, "missing"), failures.type());
  });
});
