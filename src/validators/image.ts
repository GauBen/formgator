import {
  type Failures,
  type FormInput,
  failParse,
  methods,
  safeParse,
  succeed,
} from "../definitions.ts";

/** `<input type="image">` form input validator. */
export function image(
  failures: Failures<"type" | "invalid"> = {},
): FormInput<{ x: number; y: number }> {
  return {
    ...methods,
    attributes: {},
    [safeParse]: (data, name) => {
      const x = name === "" ? data.get("x") : data.get(`${name}.x`);
      const y = name === "" ? data.get("y") : data.get(`${name}.y`);
      if (typeof x !== "string" || typeof y !== "string") return failParse("type", failures);
      const coords = {
        x: Number(x),
        y: Number(y),
      };
      if (Number.isNaN(coords.x) || Number.isNaN(coords.y)) return failParse("invalid", failures);
      return succeed(coords);
    },
  };
}
