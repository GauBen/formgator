import {
  type FormInput,
  failures,
  methods,
  safeParse,
  succeed,
} from "../definitions.js";

/**
 * `<input type="checkbox">` form input validator.
 *
 * Supported attributes:
 *
 * - `required` - Whether the input is required.
 *
 * The `value` attribute is not supported, use `select({ multiple: true })`
 * instead if you want to handle several checkboxes with the same name but
 * different values.
 */
export function checkbox(
  attributes: { required?: boolean } = {},
): FormInput<boolean> {
  return {
    ...methods,
    attributes,
    [safeParse]: (data, name) => {
      const value = data.get(name);
      if (value !== null && value !== "on") return failures.invalid();
      if (attributes.required && value === null) return failures.required();
      return succeed(value === "on");
    },
  };
}
