import {
  type Failures,
  type FormInput,
  failParse,
  methods,
  safeParse,
  succeed,
} from "../definitions.ts";

/**
 * `<input type="number">` form input validator.
 *
 * Supported attributes:
 *
 * - `required` - Whether the input is required.
 * - `min` - Minimum value.
 * - `max` - Maximum value.
 */
export function number(
  attributes?: {
    required?: false;
    min?: number;
    max?: number;
    /**
     * Accepted granularity of the value. Default is 1 (integer), set to 0 to
     * allow any number.
     *
     * The value must be a multiple of the step attribute, i.e. it could be
     * written as: `value = (min ?? 0) + k * step` with `k` an integer.
     *
     * @default 1 (only integers are accepted)
     */
    step?: number;
  },
  failures?: Failures<"type" | "required" | "invalid" | "min" | "max" | "step">,
): FormInput<number | null>;
export function number(
  attributes: {
    required: true;
    min?: number;
    max?: number;
    step?: number;
  },
  failures?: Failures<"type" | "required" | "invalid" | "min" | "max" | "step">,
): FormInput<number>;
export function number(
  attributes: {
    required?: boolean;
    min?: number;
    max?: number;
    step?: number;
  } = {},
  failures: Failures<"type" | "required" | "invalid" | "min" | "max" | "step"> = {},
): FormInput<number | null> {
  return {
    ...methods,
    attributes,
    [safeParse]: (data, name) => {
      const value = data.get(name);
      if (typeof value !== "string") return failParse("type", failures);
      if (value === "")
        return attributes.required ? failParse("required", failures) : succeed(null);

      const number = Number(value);
      if (Number.isNaN(number)) return failParse("invalid", failures);

      const step = attributes.step ?? 1;
      if (step > 0 && (number - (attributes.min ?? 0)) % step !== 0)
        return failParse("step", failures, { step: step });

      if (attributes.min !== undefined && number < attributes.min)
        return failParse("min", failures, { min: attributes.min });
      if (attributes.max !== undefined && number > attributes.max)
        return failParse("max", failures, { max: attributes.max });
      return succeed(number);
    },
  };
}
