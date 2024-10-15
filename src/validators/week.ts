import {
  type FormInput,
  failures,
  methods,
  safeParse,
  succeed,
} from "../definitions.js";

/**
 * `<input type="week">` form input validator.
 *
 * Supported attributes:
 *
 * - `required` - Whether the input is required.
 * - `min` - Minimum date.
 * - `max` - Maximum date.
 *
 * The output value is a string with the format `yyyy-mm-dd`.
 */
export function week(attributes?: {
  required?: false;
  min?: string;
  max?: string;
}): FormInput<string | null>;
export function week(attributes: {
  required: true;
  min?: string;
  max?: string;
}): FormInput<string>;
export function week(
  attributes: { required?: boolean; min?: string; max?: string } = {},
): FormInput<string | null> {
  return {
    ...methods,
    attributes,
    [safeParse]: (data, name) => {
      const value = data.get(name);
      if (typeof value !== "string") return failures.type();
      if (value === "")
        return attributes.required ? failures.required() : succeed(null);
      if (!/^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/.test(value))
        return failures.invalid();
      if (attributes.min && value < attributes.min)
        return failures.min(attributes.min);
      if (attributes.max && value > attributes.max)
        return failures.max(attributes.max);
      return succeed(value);
    },
  };
}
