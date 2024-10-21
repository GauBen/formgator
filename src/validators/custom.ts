import {
  type FormInput,
  type ReadonlyFormData,
  failures,
  methods,
  safeParse,
  succeed,
} from "../definitions.js";

/**
 * A custom validator, transformer, whatever, for you to implement if formgator falls short on
 * features.
 *
 * Returning a value will be considered a success, while throwing an error will be considered a
 * validation issue. The error message will be used as the issue message.
 */
export function custom<T>(
  fn: (data: ReadonlyFormData, name: string) => T,
  attributes = {},
): FormInput<T> {
  return {
    ...methods,
    attributes,
    [safeParse]: (data, name) => {
      try {
        return succeed(fn(data, name));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return failures.custom(message);
      }
    },
  };
}
