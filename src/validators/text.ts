import {
  type FormInput,
  methods,
  safeParseText,
  type TextAttributes,
} from "../definitions.js";

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
  attributes?: TextAttributes<false>,
): FormInput<string | null> & { trim: () => FormInput<string> };
export function text(
  attributes: TextAttributes<true>,
): FormInput<string> & { trim: () => FormInput<string> };
export function text(
  attributes: TextAttributes = {},
): FormInput<string | null> & { trim: () => FormInput<string> } {
  return {
    ...methods,
    attributes,
    safeParse: safeParseText(attributes),
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
