export const safeParse = Symbol("fg.safeParse");

// #region Types

export type Result<Data, Error> =
  | { success: true; data: Data }
  | { success: false; error: Error };

/**
 * An interface matching both `FormData` and `URLSearchParams` for read
 * operations.
 */
export interface ReadonlyFormData {
  has(name: string): boolean;
  get(name: string): string | File | null;
  getAll(name: string): Array<string | File>;
}

export type ValidationIssue =
  | { code: "type"; message: string }
  | { code: "invalid"; message: string }
  | { code: "required"; message: string }
  | { code: "minlength"; minlength: number; message: string }
  | { code: "maxlength"; maxlength: number; message: string }
  | { code: "pattern"; pattern: RegExp; message: string }
  | { code: "min"; min: number | string; message: string }
  | { code: "max"; max: number | string; message: string }
  | { code: "step"; step: number; message: string }
  | { code: "accept"; message: string }
  | { code: "transform"; message: string }
  | { code: "refine"; received: unknown; message: string };

export interface FormInput<T = unknown> {
  /** Attributes given when creating the validator. */
  attributes: Record<
    string,
    string | string[] | number | boolean | RegExp | undefined
  >;

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
  transform<U>(
    fn: (value: T) => U,
    catcher?: (error: unknown) => string,
  ): FormInput<U>;

  /** Adds a custom validation to the input. */
  refine<U extends T>(
    fn: (value: T) => value is U,
    message?: string | ((value: T) => string),
  ): FormInput<U>;
  refine(
    fn: (value: T) => unknown,
    message?: string | ((value: T) => string),
  ): FormInput<T>;

  /**
   * Makes the field optional, for inputs that may be removed or added
   * dynamically to the form.
   *
   * It returns `undefined` instead of `null` to differentiate between a missing
   * field (`undefined`) and a field with an empty value (`null`).
   */
  optional(): FormInput<T | undefined>;

  /** @private @internal */
  [safeParse]: (
    data: ReadonlyFormData,
    name: string,
  ) => Result<T, ValidationIssue>;
}

// #region Utils

export const succeed = <T>(data: T): Result<T, never> => ({
  success: true as const,
  data,
});
export const fail = <T>(errors: T): Result<never, T> => ({
  success: false as const,
  error: errors,
});

export const failures = {
  type: () => fail({ code: "type", message: "Invalid type" }),
  invalid: () => fail({ code: "invalid", message: "Invalid value" }),
  required: () => fail({ code: "required", message: "Required" }),
  minlength: (minlength: number) =>
    fail({
      code: "minlength",
      minlength,
      message: `Too short, minimum length is ${minlength}`,
    }),
  maxlength: (maxlength: number) =>
    fail({
      code: "maxlength",
      maxlength,
      message: `Too long, maximum length is ${maxlength}`,
    }),
  pattern: (pattern: RegExp) =>
    fail({ code: "pattern", pattern, message: "Invalid format" }),
  min: (min: number | string) =>
    fail({ code: "min", min, message: `Too small, minimum value is ${min}` }),
  max: (max: number | string) =>
    fail({ code: "max", max, message: `Too big, maximum value is ${max}` }),
  step: (step: number) => fail({ code: "step", step, message: "Invalid step" }),
  accept: (accept: string[]) =>
    fail({ code: "accept", accept, message: "Invalid file type" }),
  refine: (received: unknown, message: string) =>
    fail({ code: "refine", received, message }),
  transform: (message: string) => fail({ code: "transform", message }),
} satisfies {
  [K in ValidationIssue["code"]]: (
    ...args: never
  ) => Result<never, ValidationIssue>;
};

// #region Common

export type TextAttributes<Required = boolean> = Required extends true
  ? {
      required: true;
      minlength?: number | undefined;
      maxlength?: number | undefined;
      pattern?: RegExp | undefined;
    }
  : {
      required?: false | undefined;
      minlength?: number | undefined;
      maxlength?: number | undefined;
      pattern?: RegExp | undefined;
    };

export const safeParseText =
  (
    attributes: TextAttributes,
    end: (value: string) => Result<string, ValidationIssue> = succeed,
  ) =>
  (data: ReadonlyFormData, name: string) => {
    const value = data.get(name);
    if (typeof value !== "string") return failures.type();
    if (/[\r\n]/.test(value)) return failures.invalid();
    if (value === "")
      return attributes.required ? failures.required() : succeed(null);
    if (attributes.maxlength && value.length > attributes.maxlength)
      return failures.maxlength(attributes.maxlength);
    if (attributes.minlength && value.length < attributes.minlength)
      return failures.minlength(attributes.minlength);
    if (attributes.pattern && !attributes.pattern.test(value))
      return failures.pattern(attributes.pattern);
    return end(value);
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
        return failures.transform(catcher(error));
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
        return failures.refine(
          result.data,
          typeof message === "string" ? message : message(result.data),
        );
      }

      return succeed(result.data);
    },
  };
}

function optional<T>(this: FormInput<T>): FormInput<T | undefined> {
  return {
    ...this,
    [safeParse]: (data, name) => {
      if (!data.has(name)) return succeed(undefined);
      return this[safeParse](data, name);
    },
  };
}

export const methods = { transform, refine, optional };
