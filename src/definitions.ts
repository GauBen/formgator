import type { StandardSchemaV1 } from "@standard-schema/spec";

/** Symbol used to hide the internal `safeParse` method on validators. */
export const safeParse = Symbol("fg.safeParse");

// #region Types

export type Result<Data, Error> = { success: true; data: Data } | { success: false; error: Error };

/**
 * An interface matching both `FormData` and `URLSearchParams` for read
 * operations.
 */
export interface ReadonlyFormData {
  has(name: string): boolean;
  get(name: string): string | File | null;
  getAll(name: string): Array<string | File>;
}

/**
 * All possible validation issues that can be returned by a form input.
 */
export type ValidationIssue =
  | { code: "accept"; message: string }
  | { code: "custom"; message: string }
  | { code: "invalid"; message: string }
  | { code: "max"; max: number | string; message: string }
  | { code: "maxlength"; maxlength: number; message: string }
  | { code: "min"; min: number | string; message: string }
  | { code: "minlength"; minlength: number; message: string }
  | { code: "pattern"; pattern: RegExp; message: string }
  | { code: "refine"; received: unknown; message: string }
  | { code: "required"; message: string }
  | { code: "step"; step: number; message: string }
  | { code: "transform"; message: string }
  | { code: "type"; message: string };

/**
 * Base interface for all form inputs.
 */
export interface FormInput<T = unknown> {
  /** Attributes given when creating the validator. */
  attributes: Record<string, string | string[] | number | boolean | RegExp | undefined>;

  /**
   * Transforms the output of the validator into another value.
   *
   * @example
   *   text().transform((value) => value.length);
   *
   * @param fn - The transformation function.
   * @param catcher - In case the transformation function throws, this function
   *   is called to generate an error message.
   */
  transform<U>(fn: (value: T) => U, catcher?: (error: unknown) => string): FormInput<U>;

  /** Adds a custom validation to the input. */
  refine<U extends T>(
    fn: (value: T) => value is U,
    message?: string | ((value: T) => string),
  ): FormInput<U>;
  refine(fn: (value: T) => unknown, message?: string | ((value: T) => string)): FormInput<T>;

  /**
   * Makes the field optional, for inputs that may be removed or added
   * dynamically to the form.
   *
   * It returns `undefined` instead of `null` to differentiate between a missing
   * field (`undefined`) and a field with an empty value (`null`).
   *
   * You may provide a default value to be used when the field is missing.
   */
  optional(): FormInput<T | undefined>;
  optional<U>(value: U): FormInput<T | U>;

  /**
   * Transforms the value using a [Standard Schema](https://github.com/standard-schema/standard-schema)
   * compliant validator.
   *
   * Async validators are not supported.
   *
   * @example
   *   import z from 'zod';
   *   fg.text().pipe(z.string().email());
   */
  pipe<U>(schema: StandardSchemaV1<T, U>): FormInput<U>;

  /** @private @internal */
  [safeParse]: (data: ReadonlyFormData, name: string) => Result<T, ValidationIssue>;
}

// #region Utils

export const succeed = <T>(data: T): Result<T, never> => ({ success: true as const, data });
export const fail = <T>(error: T): Result<never, T> => ({ success: false as const, error });

export type Failures<K extends ValidationIssue["code"] = ValidationIssue["code"]> = Pick<
  {
    [K in ValidationIssue["code"]]?: Omit<
      ValidationIssue & { code: K },
      "code" | "message"
    > extends Record<string, never>
      ? string
      : string | ((data: Omit<ValidationIssue & { code: K }, "code" | "message">) => string);
  },
  K
>;

export const failParse = <T extends ValidationIssue["code"]>(
  ...[code, customFailures, data]: Omit<
    ValidationIssue & { code: T },
    "code" | "message"
  > extends Record<string, never>
    ? [T, Failures]
    : [T, Failures, Omit<ValidationIssue & { code: T }, "code" | "message">]
): Result<never, ValidationIssue> => {
  const failures = { ...defaultFailures, ...customFailures };
  return fail({
    code,
    // @ts-expect-error If failures[code] is a function, data is defined
    message: typeof failures[code] === "function" ? failures[code](data) : failures[code],
    ...data,
  } as never);
};

export const defaultFailures: Failures = {
  accept: "Invalid file type",
  custom: "Invalid value",
  invalid: "Invalid value",
  max: ({ max }) => `Too big, maximum value is ${max}`,
  maxlength: ({ maxlength }) => `Too long, maximum length is ${maxlength}`,
  min: ({ min }) => `Too small, minimum value is ${min}`,
  minlength: ({ minlength }) => `Too short, minimum length is ${minlength}`,
  pattern: "Invalid format",
  required: "Required",
  step: "Invalid step",
  type: "Invalid type",
};

// #region Methods

/** Transforms the output value of a form input. */
function transform<T, U>(
  this: FormInput<T>,
  fn: (value: T) => U,
  catcher: (error: unknown) => string = () => "Transformation failed",
): FormInput<U> {
  return {
    ...this,
    ...methods,
    [safeParse]: (data, name) => {
      const result = this[safeParse](data, name);
      if (result.success === false) return result;
      try {
        return succeed(fn(result.data));
      } catch (error) {
        return fail({ code: "transform", message: catcher(error) });
      }
    },
  };
}

/** Adds a custom validation to the input. */
function refine<T, U extends T>(
  this: FormInput<T>,
  fn: (value: T) => value is U,
  message: string | ((value: T) => string) = "Invalid value",
): FormInput<U> {
  return {
    ...this,
    ...methods,
    [safeParse]: (data, name) => {
      const result = this[safeParse](data, name);
      if (result.success === false) return result;

      if (!fn(result.data)) {
        return fail({
          code: "refine",
          received: result.data,
          message: typeof message === "string" ? message : message(result.data),
        });
      }

      return succeed(result.data);
    },
  };
}

function optional<T, U>(this: FormInput<T>, value?: U): FormInput<T | U> {
  return {
    ...this,
    [safeParse]: (data, name) => {
      if (!data.has(name)) return succeed(value as U);
      return this[safeParse](data, name);
    },
  };
}

function pipe<T, U>(this: FormInput<T>, schema: StandardSchemaV1<T, U>): FormInput<U> {
  return {
    ...this,
    ...methods,
    [safeParse]: (data, name) => {
      const result = this[safeParse](data, name);
      if (result.success === false) return result;

      const standardResult = schema["~standard"].validate(result.data);
      if ("then" in standardResult) throw new Error("Async validation is not supported");

      if (standardResult.issues) {
        return fail({
          code: "custom",
          message: standardResult.issues[0]?.message ?? "Unknown error",
        });
      }
      return succeed(standardResult.value);
    },
  };
}

export const methods = { transform, refine, optional, pipe };
