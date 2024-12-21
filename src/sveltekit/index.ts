import { error, fail } from "@sveltejs/kit";
import * as fg from "../index.js";

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
 *       ({ data }) => {
 *         // data.email and data.password are guaranteed to be strings
 *         // The form will be rejected as 400 Bad Request if they are missing or empty
 *       }
 *     )
 *   }
 *   ```;
 */
export function formgate<
  Action,
  Inputs extends Record<string, fg.FormInput>,
  ID extends string = string,
>(
  inputs: Inputs,
  action: Action extends (event: infer Event extends { request: Request; url: URL }) => infer Output
    ? (data: fg.Infer<Inputs>, event: Event) => Output
    : never,
  options: {
    /** @default "POST" */
    method?: "GET" | "POST";
    id?: ID;
  } = {},
): Action &
  (() => Promise<{
    id: ID;
    success: false;
    issues: fg.InferError<Inputs>;
    accepted: Partial<fg.Infer<Inputs>>;
  }>) {
  return (async (event: { request: Request; url: URL }) => {
    const data = fg
      .form(inputs)
      .safeParse(
        options.method === "GET" ? event.url.searchParams : await event.request.formData(),
      );

    if (!data.success) {
      return fail(400, {
        id: options.id ?? "default",
        success: false,
        ...data.error,
      });
    }

    return action(data.data, event);
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

    if (!data.success) {
      return error(
        400,
        `Fields ${Object.keys(data.error.issues).join(", ")} contain invalid values`,
      );
    }

    return load(data.data, event as never);
  }) as never;
}
