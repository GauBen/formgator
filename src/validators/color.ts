import { failures, type FormInput, methods, succeed } from "../definitions.js";

/**
 * `<input type="color">` form input validator.
 *
 * It does not support any attributes.
 *
 * The output value is a string with the format `#rrggbb`.
 */
export function color(): FormInput<`#${string}`> & {
  /** Returns the color as a [R, G, B] 8-bit integer triplet */
  asRGB(): FormInput<[number, number, number]>;
} {
  return {
    ...methods,
    attributes: {},
    safeParse: (data, name) => {
      const value = data.get(name);
      if (typeof value !== "string") return failures.type();
      if (!/^#[0-9a-f]{6}$/.test(value)) return failures.invalid();
      return succeed(value as `#${string}`);
    },
    asRGB() {
      return this.transform(([_, r1, r2, g1, g2, b1, b2]) => [
        parseInt(r1 + r2, 16),
        parseInt(g1 + g2, 16),
        parseInt(b1 + b2, 16),
      ]);
    },
  };
}
