import {
  type Failures,
  type FormInput,
  failParse,
  methods,
  safeParse,
  succeed,
} from "../definitions.ts";

/**
 * Validator for multiple inputs with the same name.
 *
 * Supported attributes:
 *
 * - `min` - Minimum number of values, defaults to 0.
 * - `max` - Maximum number of values, defaults to `Infinity`.
 */
export function multi(
  attributes?: {
    /** Minimum number of values. */
    min?: number;
    /** Maximum number of values. */
    max?: number;
  },
  failures: Failures<"type" | "minlength" | "maxlength"> = {},
): FormInput<string[]> & {
  /** Runs `fn` function on each element. If `fn` throws, the form is rejected. */
  map<T>(
    fn: (value: string, index: number, array: string[]) => T,
    catcher?: (error: unknown) => string,
  ): FormInput<T[]>;
} {
  return {
    ...methods,
    attributes: {},
    [safeParse]: (data, name) => {
      const values: string[] = [];
      for (const value of data.getAll(name)) {
        if (typeof value !== "string") return failParse("type", failures);
        values.push(value);
      }
      if (attributes?.min !== undefined && values.length < attributes.min)
        return failParse("minlength", failures, { minlength: attributes.min });
      if (attributes?.max !== undefined && values.length > attributes.max)
        return failParse("maxlength", failures, { maxlength: attributes.max });
      return succeed(values);
    },
    map(fn, catcher) {
      return this.transform((values) => values.map(fn), catcher);
    },
  };
}
