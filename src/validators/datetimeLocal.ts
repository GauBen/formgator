import {
  type Failures,
  type FormInput,
  failParse,
  methods,
  safeParse,
  succeed,
} from "../definitions.ts";

/**
 * `<input type="datetime-local">` form input validator.
 *
 * Supported attributes:
 *
 * - `required` - Whether the input is required.
 * - `min` - Minimum date.
 * - `max` - Maximum date.
 *
 * The output value is a string with the format `yyyy-mm-ddThh:mm`.
 */
export function datetimeLocal(
  attributes?: {
    required?: false;
    min?: string;
    max?: string;
  },
  failures?: Failures<"required" | "min" | "max" | "invalid" | "type">,
): FormInput<`${number}-${number}-${number}T${number}:${number}` | null> & {
  asNumber(): FormInput<number | null>;
  asDate(): FormInput<Date | null>;
};
export function datetimeLocal(
  attributes: {
    required: true;
    min?: string;
    max?: string;
  },
  failures?: Failures<"required" | "min" | "max" | "invalid" | "type">,
): FormInput<`${number}-${number}-${number}T${number}:${number}`> & {
  asNumber(): FormInput<number>;
  asDate(): FormInput<Date>;
};
export function datetimeLocal(
  attributes: { required?: boolean; min?: string; max?: string } = {},
  failures: Failures<"required" | "min" | "max" | "invalid" | "type"> = {},
): FormInput<`${number}-${number}-${number}T${number}:${number}` | null> & {
  asNumber(): FormInput<number | null>;
  asDate(): FormInput<Date | null>;
} {
  return {
    ...methods,
    attributes,
    [safeParse]: (data, name) => {
      const value = data.get(name);
      if (typeof value !== "string") return failParse("type", failures);
      if (value === "")
        return attributes.required ? failParse("required", failures) : succeed(null);
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return failParse("invalid", failures);
      if (Number.isNaN(Date.parse(value))) return failParse("invalid", failures);
      if (attributes.min && value < attributes.min)
        return failParse("min", failures, { min: attributes.min });
      if (attributes.max && value > attributes.max)
        return failParse("max", failures, { max: attributes.max });
      return succeed(value as `${number}-${number}-${number}T${number}:${number}`);
    },
    /**
     * Returns the date as a number representing the number of milliseconds
     * since January 1, 1970, 00:00:00 UTC.
     */
    asNumber() {
      return this.transform((value) => (value === null ? null : Date.parse(value)));
    },
    /** Returns the date as a Date object. */
    asDate() {
      return this.transform((value) => (value === null ? null : new Date(value)));
    },
  };
}
