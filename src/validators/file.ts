import {
  type Failures,
  type FormInput,
  failParse,
  methods,
  safeParse,
  succeed,
} from "../definitions.ts";

/**
 * `<input type="file">` form input validator.
 *
 * Supported attributes:
 *
 * - `multiple` - Whether the input allows multiple files.
 * - `required` - Whether the input is required.
 * - `accept` - The accepted file types, as an array of MIME types (`image/png`),
 *   MIME wildcards (`image/*`), or file extensions (`.png`).
 */
export function file(
  attributes?: {
    multiple?: false;
    required?: false;
    accept?: string[];
  },
  failures?: Failures<"type" | "required" | "accept">,
): FormInput<File | null>;
export function file(
  attributes: {
    multiple: true;
    required?: boolean;
    accept?: string[];
  },
  failures?: Failures<"type" | "required" | "accept">,
): FormInput<File[]>;
export function file(
  attributes: {
    multiple?: false;
    required: true;
    accept?: string[];
  },
  failures?: Failures<"type" | "required" | "accept">,
): FormInput<File>;
export function file(
  attributes: {
    multiple?: boolean;
    required?: boolean;
    accept?: string[];
  } = {},
  failures: Failures = {},
): FormInput<File | File[] | null> {
  const accept = (file: File) => {
    if (!attributes.accept) return true;
    return (attributes.accept as string[]).some((type) => {
      if (type.startsWith(".") && file.name.endsWith(type)) return true;
      if (type.endsWith("/*") && file.type.startsWith(type.slice(0, -1))) return true;
      if (file.type === type) return true;
    });
  };

  return {
    ...methods,
    attributes,
    [safeParse]: attributes.multiple
      ? (data, name) => {
          const values = data.getAll(name);
          if (values.length === 0)
            return attributes.required ? failParse("required", failures) : succeed([]);
          for (const value of values) {
            if (!(value instanceof File)) return failParse("type", failures);
            if (!accept(value)) return failParse("accept", failures);
          }
          return succeed(values as File[]);
        }
      : (data, name) => {
          const value = data.get(name);
          if (value !== null && !(value instanceof File)) return failParse("type", failures);
          if (value === null || (value.size === 0 && value.name === ""))
            return attributes.required ? failParse("required", failures) : succeed(null);
          if (!accept(value)) return failParse("accept", failures);
          return succeed(value);
        },
  };
}
