import {
  type Failures,
  type FormInput,
  failParse,
  methods,
  safeParse,
  succeed,
} from "../definitions.ts";

/**
 * `<input type="time">` form input validator.
 *
 * Supported attributes:
 *
 * - `required` - Whether the input is required.
 * - `min` - Minimum date.
 * - `max` - Maximum date.
 *
 * The output value is a string with the format `yyyy-mm-dd`.
 */
export function time(
  attributes?: {
    required?: false;
    min?: string;
    max?: string;
  },
  failures?: Failures<"type" | "required" | "invalid" | "min" | "max">,
): FormInput<string | null> & {
  asSeconds(): FormInput<number | null>;
};
export function time(
  attributes: {
    required: true;
    min?: string;
    max?: string;
  },
  failures?: Failures<"type" | "required" | "invalid" | "min" | "max">,
): FormInput<string> & {
  asSeconds(): FormInput<number>;
};
export function time(
  attributes: { required?: boolean; min?: string; max?: string } = {},
  failures: Failures<"type" | "required" | "invalid" | "min" | "max"> = {},
): FormInput<string | null> & {
  asSeconds(): FormInput<number | null>;
} {
  return {
    ...methods,
    attributes,
    [safeParse]: (data, name) => {
      const value = data.get(name);
      if (typeof value !== "string") return failParse("type", failures);
      if (value === "")
        return attributes.required ? failParse("required", failures) : succeed(null);
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return failParse("invalid", failures);
      if (attributes.min && value < attributes.min)
        return failParse("min", failures, { min: attributes.min });
      if (attributes.max && value > attributes.max)
        return failParse("max", failures, { max: attributes.max });
      return succeed(value);
    },
    /** Returns the time as a number of seconds. */
    asSeconds() {
      return this.transform((value) =>
        value === null ? null : Number(value.slice(0, 2)) * 3600 + Number(value.slice(3, 5)) * 60,
      );
    },
  };
}
