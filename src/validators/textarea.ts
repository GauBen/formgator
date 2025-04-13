import {
  type Failures,
  type FormInput,
  failParse,
  methods,
  safeParse,
  succeed,
} from "../definitions.ts";

/**
 * `<textarea>` form input validator.
 *
 * Supported attributes:
 *
 * - `required` - Whether the input is required.
 * - `maxlength` - Maximum length of the input.
 * - `minlength` - Minimum length of the input.
 */
export function textarea(
  attributes?: {
    required?: false;
    maxlength?: number;
    minlength?: number;
  },
  failures?: Failures<"type" | "maxlength" | "minlength" | "required">,
): FormInput<string | null> & { trim: () => FormInput<string> };
export function textarea(
  attributes: {
    required: true;
    maxlength?: number;
    minlength?: number;
  },
  failures?: Failures<"type" | "maxlength" | "minlength" | "required">,
): FormInput<string> & { trim: () => FormInput<string> };
export function textarea(
  attributes: {
    required?: boolean;
    maxlength?: number;
    minlength?: number;
  } = {},
  failures: Failures<"type" | "maxlength" | "minlength" | "required"> = {},
): FormInput<string | null> & { trim(): FormInput<string> } {
  return {
    ...methods,
    attributes,
    [safeParse]: (data, name) => {
      const value = data.get(name);
      if (typeof value !== "string") return failParse("type", failures);
      if (value === "")
        return attributes.required ? failParse("required", failures) : succeed(null);
      if (attributes.maxlength && value.length > attributes.maxlength)
        return failParse("maxlength", failures, { maxlength: attributes.maxlength });
      if (attributes.minlength && value.length < attributes.minlength)
        return failParse("minlength", failures, { minlength: attributes.minlength });
      return succeed(value);
    },
    /** Removes the leading and trailing white space from the value. */
    trim() {
      return this.transform((value) => (value ?? "").trim());
    },
  };
}
