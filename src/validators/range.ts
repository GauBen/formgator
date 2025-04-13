import type { Failures, FormInput } from "../definitions.ts";
import { number } from "./number.ts";

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
  failures: Failures<"type" | "required" | "invalid" | "min" | "max" | "step"> = {},
): FormInput<number> {
  return {
    ...number(
      {
        required: true,
        min: attributes.min ?? 0,
        max: attributes.max ?? 100,
        step: attributes.step ?? 1,
      },
      failures,
    ),
    attributes,
  };
}
