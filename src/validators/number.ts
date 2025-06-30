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
 * - `step` - Accepted granularity of the value. Default is 1 (integer), set to 0 to allow floating numbers.
 */
export function number(
  attributes?: {
    required?: false;
    min?: number;
    max?: number;
    /**
     * Accepted granularity of the value. Default is 1 (integer), set to 0 to
     * allow any number. Floating numbers are supported.
     *
     * **Must be a positive number.**
     *
     * The value must be a multiple of the step attribute, i.e. it could be
     * written as: `value = (min ?? 0) + k * step` with `k` an integer.
     *
     * @default 1
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

      if (step > 0 && !isMultiple(number - (attributes.min ?? 0), step))
        return failParse("step", failures, { step: step });

      if (attributes.min !== undefined && number < attributes.min)
        return failParse("min", failures, { min: attributes.min });
      if (attributes.max !== undefined && number > attributes.max)
        return failParse("max", failures, { max: attributes.max });
      return succeed(number);
    },
  };
}

/**
 * Checks whether `a` is a multiple of `b`, i.e. if `a % b === 0`.
 *
 * When `a` and `b` are decimal numbers, JS can be unreliable. (`5 % 0.1 === 0.09999999999999973`)
 *
 * This function returns a more reliable value.
 *
 * Useful until [Decimals](https://github.com/tc39/proposal-decimal) are available in JS for exact computations.
 *
 */
function isMultiple(a: number, b: number): boolean {
  const r = a % b;
  return r < 1e-12 || b - r < 1e-12;
}
