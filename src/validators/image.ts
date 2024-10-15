import {
  type FormInput,
  failures,
  methods,
  safeParse,
  succeed,
} from "../definitions.js";

/** `<input type="image">` form input validator. */
export function image(): FormInput<{ x: number; y: number }> {
  return {
    ...methods,
    attributes: {},
    [safeParse]: (data, name) => {
      const x = name === "" ? data.get("x") : data.get(`${name}.x`);
      const y = name === "" ? data.get("y") : data.get(`${name}.y`);
      if (typeof x !== "string" || typeof y !== "string")
        return failures.type();
      const coords = {
        x: Number(x),
        y: Number(y),
      };
      if (Number.isNaN(coords.x) || Number.isNaN(coords.y))
        return failures.invalid();
      return succeed(coords);
    },
  };
}
