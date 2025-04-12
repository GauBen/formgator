import {
  failParse,
  type Failures,
  type FormInput,
  methods,
  safeParse,
  succeed,
} from "../definitions.ts";

/**
 * `<input type="week">` form input validator.
 *
 * Supported attributes:
 *
 * - `required` - Whether the input is required.
 * - `min` - Minimum date.
 * - `max` - Maximum date.
 *
 * The output value is a string with the format `yyyy-Www` (e.g. `1999-W01`).
 */
export function week(
  attributes?: {
    required?: false;
    min?: string;
    max?: string;
  },
  failures?: Failures<"required" | "min" | "max" | "invalid" | "type">,
): FormInput<`${number}-W${number}` | null>;
export function week(
  attributes: {
    required: true;
    min?: string;
    max?: string;
  },
  failures?: Failures<"required" | "min" | "max" | "invalid" | "type">,
): FormInput<`${number}-W${number}`>;
export function week(
  attributes: { required?: boolean; min?: string; max?: string } = {},
  failures: Failures<"required" | "min" | "max" | "invalid" | "type"> = {},
): FormInput<`${number}-W${number}` | null> {
  return {
    ...methods,
    attributes,
    [safeParse]: (data, name) => {
      const value = data.get(name);
      if (typeof value !== "string") return failParse("type", failures);
      if (value === "")
        return attributes.required ? failParse("required", failures) : succeed(null);
      if (!/^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/.test(value)) return failParse("invalid", failures);
      if (attributes.min && value < attributes.min)
        return failParse("min", failures, { min: attributes.min });
      if (attributes.max && value > attributes.max)
        return failParse("max", failures, { max: attributes.max });
      return succeed(value as `${number}-W${number}`);
    },
  };
}
