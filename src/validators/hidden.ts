import {
  type Failures,
  type FormInput,
  failParse,
  methods,
  safeParse,
  succeed,
} from "../definitions.ts";

/**
 * `<input type="hidden">` form input validator.
 *
 * Not very useful, but included for completeness.
 */
export function hidden(failures: Failures<"type"> = {}): FormInput<string> {
  return {
    ...methods,
    attributes: {},
    [safeParse]: (data, name) => {
      const value = data.get(name);
      if (typeof value !== "string") return failParse("type", failures);
      return succeed(value);
    },
  };
}
