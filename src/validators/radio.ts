import {
  type Failures,
  type FormInput,
  failParse,
  methods,
  safeParse,
  succeed,
} from "../definitions.ts";

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
  failures?: Failures<"required" | "invalid" | "type">,
): FormInput<T | null>;
export function radio<T extends string>(
  values: T[],
  attributes: { required: true },
  failures?: Failures<"required" | "invalid" | "type">,
): FormInput<T>;
export function radio<T extends string>(
  values: T[],
  attributes: { required?: boolean } = {},
  failures: Failures<"required" | "invalid" | "type"> = {},
): FormInput<T | null> {
  return {
    ...methods,
    attributes,
    [safeParse]: (data, name) => {
      const value = data.get(name);
      if (value === null)
        return attributes.required ? failParse("required", failures) : succeed(null);
      if (typeof value !== "string") return failParse("type", failures);
      if (!(values as string[]).includes(value)) return failParse("invalid", failures);
      return succeed(value as T);
    },
  };
}
