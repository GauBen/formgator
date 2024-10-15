import {
  type FormInput,
  failures,
  methods,
  safeParse,
  succeed,
} from "../definitions.js";

/**
 * `<select>` form input validator.
 *
 * Supported attributes:
 *
 * - `multiple` - Whether the input allows multiple selections.
 * - `required` - Whether the input is required.
 *
 * @param values - The valid values for the input. It can be an iterable of
 *   strings or a function that returns a boolean if the value is valid.
 */
export function select<T extends string>(
  values: Iterable<T> | ((value: string) => boolean),
  attributes?: { multiple?: false; required?: boolean },
): FormInput<T>;
export function select<T extends string>(
  values: Iterable<T> | ((value: string) => boolean),
  attributes: { multiple: true; required?: boolean },
): FormInput<T[]>;
export function select<T extends string>(
  values: Iterable<T> | ((value: string) => boolean),
  attributes: { multiple?: boolean; required?: boolean } = {},
): FormInput<T | T[]> {
  const accept =
    values instanceof Set
      ? (value: string) => values.has(value)
      : typeof values === "function"
        ? values
        : (() => {
            const set = new Set<string>(values);
            return (value: string) => set.has(value);
          })();

  return {
    ...methods,
    attributes,
    [safeParse]: attributes.multiple
      ? (data, name) => {
          const values = data.getAll(name);
          if (values.length === 0 && attributes.required)
            return failures.required();
          for (const value of values) {
            if (typeof value !== "string") return failures.type();
            if (!accept(value)) return failures.invalid();
          }
          return succeed(values as T[]);
        }
      : (data, name) => {
          const value = data.get(name);
          if (typeof value !== "string") return failures.type();
          if (attributes.required && value === "") return failures.required();
          if (!accept(value)) return failures.invalid();
          return succeed(value as T);
        },
  };
}
