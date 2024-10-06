import type { FormInput } from "../definitions.js";
import { number } from "./number.js";

/**
 * `<input type="range">` form input validator.
 *
 * Supported attributes:
 *
 * - `min` - Minimum value, defaults to `0`.
 * - `max` - Maximum value, defaults to `100`.
 * - `step` - Step value, defaults to `1`.
 */
export function range(
  attributes: { min?: number; max?: number; step?: number } = {},
): FormInput<number> {
  return {
    ...number({
      required: true,
      min: attributes.min ?? 0,
      max: attributes.max ?? 100,
      step: attributes.step ?? 1,
    }),
    attributes,
  };
}
