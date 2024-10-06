import {
  type FormInput,
  type TextAttributes,
  failures,
  methods,
  safeParseText,
  succeed,
} from "../definitions.js";

/**
 * `<input type="url">` form input validator.
 *
 * Supported attributes:
 *
 * - `required` - Whether the input is required.
 */
export function url(
  attributes?: TextAttributes<false>,
): FormInput<string | null> & { asURL(): FormInput<URL | null> };
export function url(
  attributes: TextAttributes<true>,
): FormInput<string> & { asURL(): FormInput<URL> };
export function url(
  attributes: TextAttributes = {},
): FormInput<string | null> & { asURL(): FormInput<URL | null> } {
  return {
    ...methods,
    attributes,
    safeParse: safeParseText(attributes, (value) =>
      URL.canParse(value) ? succeed(value) : failures.invalid(),
    ),
    asURL() {
      return this.transform((url) => (url === null ? null : new URL(url)));
    },
  };
}
