import {
  type Failures,
  type FormInput,
  failParse,
  methods,
  safeParse,
  succeed,
} from "../definitions.ts";

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
export function text(
  attributes?: {
    required?: false;
    minlength?: number;
    maxlength?: number;
    pattern?: RegExp;
  },
  failures?: Failures<"type" | "invalid" | "required" | "maxlength" | "minlength" | "pattern">,
): FormInput<string | null> & { trim(): FormInput<string> };
export function text(
  attributes: {
    required: true;
    minlength?: number;
    maxlength?: number;
    pattern?: RegExp;
  },
  failures?: Failures<"type" | "invalid" | "required" | "maxlength" | "minlength" | "pattern">,
): FormInput<string> & { trim(): FormInput<string> };
export function text(
  attributes: {
    required?: boolean;
    minlength?: number;
    maxlength?: number;
    pattern?: RegExp;
  } = {},
  failures: Failures<"type" | "invalid" | "required" | "maxlength" | "minlength" | "pattern"> = {},
): FormInput<string | null> & { trim(): FormInput<string> } {
  return {
    ...methods,
    attributes,
    [safeParse]: (data, name) => {
      const value = data.get(name);
      if (typeof value !== "string") return failParse("type", failures);
      if (/[\r\n]/.test(value)) return failParse("invalid", failures);
      if (value === "")
        return attributes.required ? failParse("required", failures) : succeed(null);
      if (attributes.maxlength && value.length > attributes.maxlength)
        return failParse("maxlength", failures, { maxlength: attributes.maxlength });
      if (attributes.minlength && value.length < attributes.minlength)
        return failParse("minlength", failures, { minlength: attributes.minlength });
      if (attributes.pattern && !attributes.pattern.test(value))
        return failParse("pattern", failures, { pattern: attributes.pattern });
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
