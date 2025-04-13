import {
  type Failures,
  type FormInput,
  failParse,
  methods,
  safeParse,
  succeed,
} from "../definitions.ts";

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
  attributes?: {
    multiple?: false;
    required?: false;
    minlength?: number;
    maxlength?: number;
    pattern?: RegExp;
  },
  failures?: Failures<"type" | "required" | "maxlength" | "minlength" | "invalid" | "pattern">,
): FormInput<string | null>;
export function email(
  attributes: {
    multiple?: false;
    required: true;
    minlength?: number;
    maxlength?: number;
    pattern?: RegExp;
  },
  failures?: Failures<"type" | "required" | "maxlength" | "minlength" | "invalid" | "pattern">,
): FormInput<string>;
export function email(
  attributes: {
    multiple: true;
    required?: boolean;
    minlength?: number;
    maxlength?: number;
    pattern?: RegExp;
  },
  failures?: Failures<"type" | "required" | "maxlength" | "minlength" | "invalid" | "pattern">,
): FormInput<string[]>;
export function email(
  attributes: {
    multiple?: boolean;
    required?: boolean;
    minlength?: number;
    maxlength?: number;
    pattern?: RegExp;
  } = {},
  failures: Failures<"type" | "required" | "maxlength" | "minlength" | "invalid" | "pattern"> = {},
): FormInput<string | string[] | null> {
  return {
    ...methods,
    attributes,
    [safeParse]: (data, name) => {
      const value = data.get(name);
      if (typeof value !== "string") return failParse("type", failures);
      if (/[\r\n]/.test(value)) return failParse("invalid", failures);
      if (value === "")
        return attributes.required
          ? failParse("required", failures)
          : succeed(attributes.multiple ? [] : null);
      if (attributes.maxlength && value.length > attributes.maxlength)
        return failParse("maxlength", failures, { maxlength: attributes.maxlength });
      if (attributes.minlength && value.length < attributes.minlength)
        return failParse("minlength", failures, { minlength: attributes.minlength });

      if (attributes.multiple) {
        // Emails are comma-separated, with optional white space
        const values = value.split(",").map((value) => value.trim());
        for (const email of values) {
          if (!emailRegex.test(email)) return failParse("invalid", failures);
          if (attributes.pattern && !attributes.pattern.test(email))
            return failParse("pattern", failures, { pattern: attributes.pattern });
        }
        return succeed(values);
      } else {
        if (!emailRegex.test(value)) return failParse("invalid", failures);
        if (attributes.pattern && !attributes.pattern.test(value))
          return failParse("pattern", failures, { pattern: attributes.pattern });
        return succeed(value);
      }
    },
  };
}
