import { type FormInput, failures, methods, succeed } from "../definitions.js";

/**
 * `<input type="number">` form input validator.
 *
 * Supported attributes:
 *
 * - `required` - Whether the input is required.
 * - `min` - Minimum value.
 * - `max` - Maximum value.
 */
export function number(attributes?: {
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
}): FormInput<number | null>;
export function number(attributes: {
  required: true;
  min?: number;
  max?: number;
  step?: number;
}): FormInput<number>;
export function number(
  attributes: {
    required?: boolean;
    min?: number;
    max?: number;
    step?: number;
  } = {},
): FormInput<number | null> {
  return {
    ...methods,
    attributes,
    safeParse: (data, name) => {
      const value = data.get(name);
      if (typeof value !== "string") return failures.type();
      if (value === "")
        return attributes.required ? failures.required() : succeed(null);

      const number = Number(value);
      if (Number.isNaN(number)) return failures.invalid();

      const step = attributes.step ?? 1;
      if (step > 0 && (number - (attributes.min ?? 0)) % step !== 0)
        return failures.step(step);

      if (attributes.min !== undefined && number < attributes.min)
        return failures.min(attributes.min);
      if (attributes.max !== undefined && number > attributes.max)
        return failures.max(attributes.max);
      return succeed(number);
    },
  };
}
