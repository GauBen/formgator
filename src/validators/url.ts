import {
  type Failures,
  type FormInput,
  failParse,
  methods,
  safeParse,
  succeed,
} from "../definitions.ts";
import { text } from "./text.ts";

/**
 * `<input type="url">` form input validator.
 *
 * Supported attributes:
 *
 * - `required` - Whether the input is required.
 * - `maxlength` - Maximum length of the input.
 * - `minlength` - Minimum length of the input.
 * - `pattern` - Regular expression pattern to match.
 */
export function url(
  attributes?: {
    required?: false;
    minlength?: number;
    maxlength?: number;
    pattern?: RegExp;
  },
  failures?: Failures<"type" | "invalid" | "required" | "maxlength" | "minlength" | "pattern">,
): FormInput<string | null> & { asURL(): FormInput<URL | null> };
export function url(
  attributes: {
    required: true;
    minlength?: number;
    maxlength?: number;
    pattern?: RegExp;
  },
  failures?: Failures<"type" | "invalid" | "required" | "maxlength" | "minlength" | "pattern">,
): FormInput<string> & { asURL(): FormInput<URL> };
export function url(
  attributes = {},
  failures: Failures<"type" | "invalid" | "required" | "maxlength" | "minlength" | "pattern"> = {},
): FormInput<string | null> & { asURL(): FormInput<URL | null> } {
  return {
    ...methods,
    attributes,
    [safeParse]: (data, name) => {
      const result = text(attributes, failures)[safeParse](data, name);
      if (result.success === false) return result;
      if (result.data === null) return succeed(null);
      if (!URL.canParse(result.data)) return failParse("invalid", failures);
      return succeed(result.data);
    },
    asURL() {
      return this.transform((url) => (url === null ? null : new URL(url)));
    },
  };
}
