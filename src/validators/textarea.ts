import { type FormInput, failures, methods, succeed } from "../definitions.js";

/**
 * `<textarea>` form input validator.
 *
 * Supported attributes:
 *
 * - `required` - Whether the input is required.
 * - `maxlength` - Maximum length of the input.
 * - `minlength` - Minimum length of the input.
 */
export function textarea(attributes?: {
  required?: false;
  maxlength?: number;
  minlength?: number;
}): FormInput<string | null> & { trim: () => FormInput<string> };
export function textarea(attributes: {
  required: true;
  maxlength?: number;
  minlength?: number;
}): FormInput<string> & { trim: () => FormInput<string> };
export function textarea(
  attributes: {
    required?: boolean;
    maxlength?: number;
    minlength?: number;
  } = {},
): FormInput<string | null> & { trim: () => FormInput<string> } {
  return {
    ...methods,
    attributes,
    safeParse: (data, name) => {
      const value = data.get(name);
      if (typeof value !== "string") return failures.type();
      if (value === "")
        return attributes.required ? failures.required() : succeed(null);
      if (attributes.maxlength && value.length > attributes.maxlength)
        return failures.maxlength(attributes.maxlength);
      if (attributes.minlength && value.length < attributes.minlength)
        return failures.minlength(attributes.minlength);
      return succeed(value);
    },
    /** Removes the leading and trailing white space from the value. */
    trim() {
      return this.transform((value) => (value ?? "").trim());
    },
  };
}
