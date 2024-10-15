import {
  type FormInput,
  type ReadonlyFormData,
  type Result,
  type ValidationIssue,
  fail,
  safeParse,
  succeed,
} from "./definitions.js";

export { checkbox } from "./validators/checkbox.js";
export { color } from "./validators/color.js";
export { date } from "./validators/date.js";
export { datetimeLocal } from "./validators/datetimeLocal.js";
export { email } from "./validators/email.js";
export { file } from "./validators/file.js";
export { hidden } from "./validators/hidden.js";
export { image } from "./validators/image.js";
export { month } from "./validators/month.js";
export { number } from "./validators/number.js";
export { radio } from "./validators/radio.js";
export { range } from "./validators/range.js";
export { select } from "./validators/select.js";
export {
  text as password,
  text as search,
  text as tel,
  text,
} from "./validators/text.js";
export { textarea } from "./validators/textarea.js";
export { time } from "./validators/time.js";
export { url } from "./validators/url.js";
export { week } from "./validators/week.js";
export type { FormInput, ValidationIssue };

const stringifyRegex = (regex: RegExp) => {
  if (regex.flags !== "u") console.warn("[formgator] RegExp attribute must be written with u flag");
  if (!regex.source.startsWith("^") || !regex.source.endsWith("$"))
    console.warn("[formgator] RegExp attribute must start with ^ and end with $");
  return regex.source.replaceAll(/^\^|\$$/g, "");
};

/**
 * Allows you to splat attributes into Svelte HTML template.
 *
 * This feature is considered experimental and may be removed in the future.
 */
export function splat(attributes: FormInput["attributes"]) {
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

export type Infer<T extends Record<string, FormInput>> = {
  [K in keyof T]: T[K] extends FormInput<infer U> ? U : never;
} extends infer O // Black magic to make the type human-readable
  ? { [K in keyof O]: O[K] }
  : never;

export type InferError<T extends Record<string, FormInput>> = {
  [K in keyof T]?: ValidationIssue;
};

export interface FormGator<T extends Record<string, FormInput>> {
  inputs: T;
  parse(data: ReadonlyFormData): Infer<T>;
  safeParse(data: ReadonlyFormData): Result<
    Infer<T>,
    {
      issues: { [K in keyof T]?: ValidationIssue };
      accepted: Partial<Infer<T>>;
    }
  >;
}

export class FormgatorError<T extends Record<string, FormInput>> extends Error {
  constructor(
    public issues: InferError<T>,
    public accepted: Partial<Infer<T>>,
  ) {
    super("Form validation failed");
    this.name = "FormgatorError";
  }
}

/** Creates a form validator from a record of form inputs. */
export function form<T extends Record<string, FormInput<unknown>>>(inputs: T): FormGator<T> {
  return {
    inputs,
    safeParse: (data) => {
      const entries: Array<[string, unknown]> = [];
      const errorEntries: Array<[string, ValidationIssue | null]> = [];
      for (const [name, input] of Object.entries(inputs)) {
        const result = input[safeParse](data, name);
        if (result.success === false) errorEntries.push([name, result.error]);
        else entries.push([name, result.data]);
      }
      return errorEntries.length === 0
        ? succeed(Object.fromEntries(entries) as Infer<T>)
        : fail({
            issues: Object.fromEntries(errorEntries) as InferError<T>,
            accepted: Object.fromEntries(entries) as Partial<Infer<T>>,
          });
    },
    parse(data) {
      const result = this.safeParse(data);
      if (result.success === false)
        throw new FormgatorError(result.error.issues, result.error.accepted);
      return result.data;
    },
  };
}
