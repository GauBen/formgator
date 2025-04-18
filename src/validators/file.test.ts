import { describe, it } from "node:test";
import assert from "../assert.ts";
import { failParse, safeParse, succeed } from "../definitions.ts";
import { file } from "./file.ts";

describe("file()", async () => {
  it("should accept valid inputs", () => {
    const data = new FormData();
    const f = new File([], "file.txt", { type: "text/plain" });
    data.append("input", f);
    assert.deepEqualTyped(file()[safeParse](data, "missing"), succeed(null));
    assert.deepEqualTyped(file()[safeParse](data, "input"), succeed(f));
    assert.deepEqualTyped(file({ multiple: true })[safeParse](data, "input"), succeed([f]));
    assert.deepEqualTyped(file({ accept: [".txt"] })[safeParse](data, "input"), succeed(f));
    assert.deepEqualTyped(file({ accept: ["text/*"] })[safeParse](data, "input"), succeed(f));
    assert.deepEqualTyped(file({ accept: ["text/plain"] })[safeParse](data, "input"), succeed(f));
    assert.deepEqualTyped(file({ multiple: true })[safeParse](data, "missing"), succeed([]));
  });

  it("should refuse invalid inputs", () => {
    const data = new FormData();
    const f = new File([], "file.txt", { type: "text/plain" });
    data.append("input", "invalid");
    data.append("ok", f);

    assert.deepEqualTyped(file()[safeParse](data, "input"), failParse("type", {}));
    assert.deepEqualTyped(
      file({ required: true })[safeParse](data, "missing"),
      failParse("required", {}),
    );
    assert.deepEqualTyped(
      file({ multiple: true })[safeParse](data, "input"),
      failParse("type", {}),
    );
    assert.deepEqualTyped(
      file({ multiple: true, required: true })[safeParse](data, "missing"),
      failParse("required", {}),
    );
    assert.deepEqualTyped(
      file({ accept: [".jpg"] })[safeParse](data, "ok"),
      failParse("accept", {}),
    );
    assert.deepEqualTyped(
      file({ accept: ["image/*"] })[safeParse](data, "ok"),
      failParse("accept", {}),
    );
    assert.deepEqualTyped(
      file({ accept: ["image/jpeg"] })[safeParse](data, "ok"),
      failParse("accept", {}),
    );
    assert.deepEqualTyped(
      file({ multiple: true, accept: [".jpg"] })[safeParse](data, "ok"),
      failParse("accept", {}),
    );
  });
});
