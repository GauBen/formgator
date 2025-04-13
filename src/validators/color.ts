import {
  type Failures,
  type FormInput,
  failParse,
  methods,
  safeParse,
  succeed,
} from "../definitions.ts";

/**
 * `<input type="color">` form input validator.
 *
 * It does not support any attributes.
 *
 * The output value is a string with the format `#rrggbb`.
 */
export function color(failures: Failures<"type" | "invalid"> = {}): FormInput<`#${string}`> & {
  /** Returns the color as a [R, G, B] 8-bit integer triplet */
  asRGB(): FormInput<[number, number, number]>;
} {
  return {
    ...methods,
    attributes: {},
    [safeParse]: (data, name) => {
      const value = data.get(name);
      if (typeof value !== "string") return failParse("type", failures);
      if (!/^#[0-9a-f]{6}$/.test(value)) return failParse("invalid", failures);
      return succeed(value as `#${string}`);
    },
    asRGB() {
      return this.transform(([_, r1, r2, g1, g2, b1, b2]) => [
        Number.parseInt(r1 + r2, 16),
        Number.parseInt(g1 + g2, 16),
        Number.parseInt(b1 + b2, 16),
      ]);
    },
  };
}
