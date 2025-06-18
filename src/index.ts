/**
 * Formgator, a validation library for `FormData` and `URLSearchParams` objects.
 *
 * @example
 * ```ts
 * import * as fg from "formgator";
 *
 * // Describe the form schema
 * const schema = fg.form({
 *   email: fg.email({ required: true }),
 *   password: fg.password({ required: true }),
 * });
 *
 * // Retrieve the data from a form
 * const data = new FormData(document.querySelector("form"));
 * const result = schema.parse(data);
 *
 * // Handle the result
 * if (result.success) {
 *   console.log(result.data.email);
 * } else {
 *   console.error(result.error.issues);
 * }
 * ```
 *
 * If you're using SvelteKit, there is a separate export for SvelteKit-specific utilities:
 *
 * ```ts
 * import { formgate } from "formgator/sveltekit";
 * ```
 *
 * @module
 */

import type { StandardSchemaV1 } from "@standard-schema/spec";
import {
  type Failures,
  type FormInput,
  type ReadonlyFormData,
  type Result,
  type ValidationIssue,
  fail,
  succeed,
  safeParse as symbol,
} from "./definitions.ts";

export { checkbox } from "./validators/checkbox.ts";
export { color } from "./validators/color.ts";
export { custom } from "./validators/custom.ts";
export { date } from "./validators/date.ts";
export { datetimeLocal } from "./validators/datetimeLocal.ts";
export { email } from "./validators/email.ts";
export { file } from "./validators/file.ts";
export { hidden } from "./validators/hidden.ts";
export { image } from "./validators/image.ts";
export { month } from "./validators/month.ts";
export { multi } from "./validators/multi.ts";
export { number } from "./validators/number.ts";
export { radio } from "./validators/radio.ts";
export { range } from "./validators/range.ts";
export { select } from "./validators/select.ts";
export { text, text as password, text as search, text as tel } from "./validators/text.ts";
export { textarea } from "./validators/textarea.ts";
export { time } from "./validators/time.ts";
export { url } from "./validators/url.ts";
export { week } from "./validators/week.ts";
export type { FormInput, ValidationIssue };

const stringifyRegex = (regex: RegExp) => {
  // The compiled pattern of an input uses v mode.
  // https://html.spec.whatwg.org/multipage/input.html#compiled-pattern-regular-expression
  if (regex.flags !== "v") console.warn("[formgator] RegExp attribute must be written with v flag");
  if (!regex.source.startsWith("^") || !regex.source.endsWith("$"))
    console.warn("[formgator] RegExp attribute must start with ^ and end with $");
  return regex.source.replaceAll(/^\^|\$$/g, "");
};

/**
 * Allows you to splat attributes into Svelte HTML template.
 *
 * This feature is considered experimental and may be removed in the future.
 */
export function splat(
  attributes: FormInput["attributes"],
): Record<string, string | number | boolean | undefined> {
  return Object.fromEntries(
    Object.entries(attributes)
      .filter(([, value]) => value !== false && value !== undefined)
      .map(([key, value]) => [
        key,
        Array.isArray(value)
          ? value.join(",")
          : value instanceof RegExp
            ? stringifyRegex(value)
            : value,
      ]),
  );
}

/**
 * Transforms an object of form inputs into the success object.
 */
export type Output<T extends Record<string, FormInput> = Record<string, FormInput<unknown>>> = {
  [K in keyof T]: T[K] extends FormInput<infer U> ? U : never;
} extends infer O // Black magic to make the type human-readable
  ? { [K in keyof O]: O[K] }
  : never;

/**
 * Transforms an object of form inputs into the issues object.
 */
export type Issues<T extends Record<string, FormInput> = Record<string, FormInput<unknown>>> = {
  [K in keyof T]?: ValidationIssue;
} extends infer O // Black magic to make the type human-readable
  ? { [K in keyof O]: O[K] }
  : never;

/**
 * An error thrown when using `form.parse()`. It has two fields: `issues` and `accepted`,
 * containing the issues and accepted values respectively.
 *
 * Type-safety cannot be guaranteed when using exceptions. If you want type-safety, use
 * `form.safeParse()`.
 */
export class FormgatorError extends Error {
  issues: Issues;
  accepted: Partial<Output>;
  constructor(issues: Issues, accepted: Partial<Output>) {
    super("Form validation failed");
    this.name = "FormgatorError";
    this.issues = issues;
    this.accepted = accepted;
  }
}

/**
 * Creates a form validator from a record of form inputs.
 *
 * The return schema has two methods: `parse` and `safeParse`:
 * - `parse(data: FormData)` returns the data object if valid, throws a `FormgatorError` otherwise.
 * - `safeParse(data: FormData)` returns an object with `success` a success boolean flag, and
 *   either `data` or `error` containing the parsed data or the issues respectively.
 */
export function form<T extends Record<string, FormInput<unknown>>>(
  inputs: T,
): {
  /** The form schema object, returned as is. */
  inputs: T;
  /**
   * Takes a `FormData` or `URLSearchParams` object and returns an object with the same shape as
   * the schema if the data is valid, or throws a `FormgatorError` otherwise.
   */
  parse(data: ReadonlyFormData): Output<T>;
  /**
   * Takes a `FormData` or `URLSearchParams` object and returns an object with a `success` flag,
   * and either `data` or `error` containing the parsed data or the issues respectively.
   */
  safeParse(data: ReadonlyFormData): Result<
    Output<T>,
    {
      /** An object that maps fields to their validation issue. */
      issues: Issues<T>;
      /** Not all fields might be invalid. Valid values are accessible in this object. */
      accepted: Partial<Output<T>>;
    }
  >;
  "~standard": StandardSchemaV1.Props<ReadonlyFormData, Output<T>>;
} {
  const safeParse = (data: ReadonlyFormData) => {
    const entries: Array<[string, unknown]> = [];
    const errorEntries: Array<[string, ValidationIssue | null]> = [];
    for (const [name, input] of Object.entries(inputs)) {
      const result = input[symbol](data, name);
      if (result.success === false) errorEntries.push([name, result.error]);
      else entries.push([name, result.data]);
    }
    return errorEntries.length === 0
      ? succeed(Object.fromEntries(entries) as Output<T>)
      : fail({
          issues: Object.fromEntries(errorEntries) as Issues<T>,
          accepted: Object.fromEntries(entries) as Partial<Output<T>>,
        });
  };
  return {
    inputs,
    safeParse,
    parse: (data) => {
      const result = safeParse(data);
      if (result.success === false)
        throw new FormgatorError(result.error.issues, result.error.accepted);
      return result.data;
    },
    "~standard": {
      version: 1,
      vendor: "formgator",
      validate: (value) => {
        if (!(value instanceof URLSearchParams) && !(value instanceof FormData))
          return { issues: [{ message: "value must be FormData or URLSearchParams" }] };
        const result = safeParse(value);
        if (result.success) return { value: result.data };
        return {
          issues: Object.entries<ValidationIssue>(result.error.issues).map(
            ([key, { message }]) => ({ message, path: [key] }),
          ),
        };
      },
    },
  };
}
