import { type FormInput, failures, methods, safeParse, succeed } from "../definitions.ts";

/**
 * `<input type="text">` form input validator.
 *
 * Does not accept new lines, use `textarea()` instead.
 *
 * Supported attributes:
 *
 * - `required` - Whether the input is required.
 * - `maxlength` - Maximum length of the input.
 * - `minlength` - Minimum length of the input.
 * - `pattern` - Regular expression pattern to match.
 */
export function text(attributes?: {
  required?: false;
  minlength?: number;
  maxlength?: number;
  pattern?: RegExp;
}): FormInput<string | null> & { trim(): FormInput<string> };
export function text(attributes: {
  required: true;
  minlength?: number;
  maxlength?: number;
  pattern?: RegExp;
}): FormInput<string> & { trim(): FormInput<string> };
export function text(
  attributes: {
    required?: boolean;
    minlength?: number;
    maxlength?: number;
    pattern?: RegExp;
  } = {},
): FormInput<string | null> & { trim(): FormInput<string> } {
  return {
    ...methods,
    attributes,
    [safeParse]: (data, name) => {
      const value = data.get(name);
      if (typeof value !== "string") return failures.type();
      if (/[\r\n]/.test(value)) return failures.invalid();
      if (value === "") return attributes.required ? failures.required() : succeed(null);
      if (attributes.maxlength && value.length > attributes.maxlength)
        return failures.maxlength(attributes.maxlength);
      if (attributes.minlength && value.length < attributes.minlength)
        return failures.minlength(attributes.minlength);
      if (attributes.pattern && !attributes.pattern.test(value))
        return failures.pattern(attributes.pattern);
      return succeed(value);
    },
    /**
     * Removes the leading and trailing white space from the value.
     *
     * If value is null or whitespace, it will be converted to an empty string.
     */
    trim() {
      return this.transform((value) => (value ?? "").trim());
    },
  };
}
