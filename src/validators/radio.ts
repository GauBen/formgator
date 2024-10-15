import {
  type FormInput,
  failures,
  methods,
  safeParse,
  succeed,
} from "../definitions.js";

/**
 * `<input type="radio">` form input validator.
 *
 * Supported attributes:
 *
 * - `required` - Whether the input is required.
 */
export function radio<T extends string>(
  values: T[],
  attributes?: { required?: false },
): FormInput<T | null>;
export function radio<T extends string>(
  values: T[],
  attributes: { required: true },
): FormInput<T>;
export function radio<T extends string>(
  values: T[],
  attributes: { required?: boolean } = {},
): FormInput<T | null> {
  return {
    ...methods,
    attributes,
    [safeParse]: (data, name) => {
      const value = data.get(name);
      if (value === null)
        return attributes.required ? failures.required() : succeed(null);
      if (typeof value !== "string") return failures.type();
      if (!(values as string[]).includes(value)) return failures.invalid();
      return succeed(value as T);
    },
  };
}
