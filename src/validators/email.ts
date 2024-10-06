import {
  type FormInput,
  type TextAttributes,
  failures,
  methods,
  succeed,
} from "../definitions.js";

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#validation
const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * `<input type="email">` form input validator.
 *
 * Supported attributes:
 *
 * - `required` - Whether the input is required.
 * - `maxlength` - Maximum length of the input.
 * - `minlength` - Minimum length of the input.
 * - `pattern` - Regular expression pattern to match by each email address.
 * - `multiple` - Whether the input allows multiple comma-separated email
 *   addresses.
 */
export function email(
  attributes?: { multiple?: false } & TextAttributes<false>,
): FormInput<string | null>;
export function email(
  attributes: { multiple?: false } & TextAttributes<true>,
): FormInput<string>;
export function email(
  attributes: { multiple: true } & TextAttributes,
): FormInput<string[]>;
export function email(
  attributes: { multiple?: boolean } & TextAttributes = {},
): FormInput<string | string[] | null> {
  return {
    ...methods,
    attributes,
    safeParse: (data, name) => {
      const value = data.get(name);
      if (typeof value !== "string") return failures.type();
      if (/[\r\n]/.test(value)) return failures.invalid();
      if (value === "")
        return attributes.required
          ? failures.required()
          : succeed(attributes.multiple ? [] : null);
      if (attributes.maxlength && value.length > attributes.maxlength)
        return failures.maxlength(attributes.maxlength);
      if (attributes.minlength && value.length < attributes.minlength)
        return failures.minlength(attributes.minlength);

      if (attributes.multiple) {
        // Emails are comma-separated, with optional white space
        const values = value.split(",").map((value) => value.trim());
        for (const email of values) {
          if (!emailRegex.test(email)) return failures.invalid();
          if (attributes.pattern && !attributes.pattern.test(email))
            return failures.pattern(attributes.pattern);
        }
        return succeed(values);
      } else {
        if (!emailRegex.test(value)) return failures.invalid();
        if (attributes.pattern && !attributes.pattern.test(value))
          return failures.pattern(attributes.pattern);
        return succeed(value);
      }
    },
  };
}
