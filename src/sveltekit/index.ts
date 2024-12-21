import { error, fail, type SubmitFunction } from "@sveltejs/kit";
import * as fg from "../index.js";

class FormError extends Error {
  constructor(public issues: Record<string, string>) {
    super("Form validation failed");
  }
}

/**
 * Throws an error that should be treated as a validation error. This allows refining the validation process inside the action function.
 *
 * Usage: `formfail({ email: "Account already exists" })`
 *
 * @example
 *   ```ts
 *   export const actions = {
 *     register: formgate(
 *       {
 *         email: fg.email({ required: true }),
 *         password: fg.password({ required: true }),
 *       },
 *       async ({ data }) => {
 *         if (await userExists(data.email))
 *           formfail({ email: "Account already exists" });
 *
 *         // ...
 *       }
 *     )
 *   }
 *   ```
 */
export function formfail(issues: Record<string, string>): never {
  throw new FormError(issues);
}

/**
 * Reports validation issues to the user interface using the `setCustomValidity` API.
 *
 * Usage: `<form use:enhance={reportValidity} />`
 */
export function reportValidity(): ReturnType<SubmitFunction> {
  return ({ update, result, formElement }) => {
    update();

    if (result.type === "failure" && typeof result.data?.issues === "object") {
      const issues = result.data.issues as Record<string, fg.ValidationIssue>;

      for (const element of formElement.elements) {
        if (!(element instanceof HTMLInputElement)) continue;

        // If an issue exists for the element, set the custom validity,
        // otherwise, clear the custom validity with an empty string
        const issue = issues[element.name]?.message ?? "";
        element.setCustomValidity(issue);
        element.reportValidity();

        // Clear the custom validity when the user interacts with the element
        element.addEventListener("input", () => element.setCustomValidity(""), { once: true });
      }
    }
  };
}

/**
 * Adds request validation to a [form
 * action](https://kit.svelte.dev/docs/form-actions).
 *
 * @example
 *   ```ts
 *   export const actions = {
 *     login: formgate(
 *       {
 *         email: fg.email({ required: true }),
 *         password: fg.password({ required: true }),
 *       },
 *       (data) => {
 *         // data.email and data.password are guaranteed to be strings
 *         // The form will be rejected as 400 Bad Request if they are missing or empty
 *       }
 *     )
 *   }
 *   ```
 */
export function formgate<
  Action,
  Output,
  Inputs extends Record<string, fg.FormInput>,
  ID extends string = string,
>(
  inputs: Inputs,
  action: (
    data: fg.Infer<Inputs>,
    event: Action extends (event: infer Event) => unknown ? Event : never,
  ) => Output,
  options: {
    id?: ID;
  } = {},
): () =>
  | Awaited<Output>
  | {
      id: ID;
      success: false;
      issues: fg.InferError<Inputs>;
      accepted: Partial<fg.Infer<Inputs>>;
    } {
  return (async (event: { request: Request; url: URL }) => {
    const data = fg.form(inputs).safeParse(await event.request.formData());

    if (!data.success) {
      return fail(400, {
        id: options.id ?? "default",
        success: false,
        ...data.error,
      });
    }

    try {
      return await action(data.data, event as never);
    } catch (error) {
      if (error instanceof FormError) {
        return fail(400, {
          id: options.id ?? "default",
          success: false,
          // Process incoming issues to mark them as "custom" issues
          issues: Object.fromEntries(
            Object.entries(error.issues).map(([name, message]) => [
              name,
              { code: "custom", message } satisfies fg.ValidationIssue,
            ]),
          ),
          // Remove values that were rejected
          accepted: Object.fromEntries(
            Object.entries(data.data).filter(([name]) => !(name in error.issues)),
          ),
        });
      }

      throw error;
    }
  }) as never;
}

/**
 * Adds request validation to a [load function](https://kit.svelte.dev/docs/load#page-data).
 *
 * @example
 *   ```ts
 *   export const load = loadgate(
 *     {
 *       page: fg.number({ required: true }).optional(1),
 *       search: fg.search().trim().optional(),
 *     },
 *     (data) => {
 *       // data.page is a number, defaults to 1
 *       // data.search is string | undefined
 *     }
 *   )
 *   ```
 */
export function loadgate<Load, Output, Inputs extends Record<string, fg.FormInput>>(
  inputs: Inputs,
  load: (
    data: fg.Infer<Inputs>,
    event: Load extends (event: infer Event) => unknown ? Event : never,
  ) => Output,
): Load & (() => Output) {
  return ((event: { url: URL }) => {
    const data = fg.form(inputs).safeParse(event.url.searchParams);

    if (!data.success)
      error(400, `Fields ${Object.keys(data.error.issues).join(", ")} contain invalid values`);

    return load(data.data, event as never);
  }) as never;
}
