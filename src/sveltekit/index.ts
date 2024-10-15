import { fail } from "@sveltejs/kit";
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
    issues: fg.InferError<Inputs>;
    accepted: Partial<fg.Infer<Inputs>>;
  }>) {
  return (async (event: { request: Request; url: URL }) => {
    const data = fg
      .form(inputs)
      .safeParse(
        options.method === "GET" ? event.url.searchParams : await event.request.formData(),
      );

    if (!data.success) return fail(400, { id: options.id ?? "default", ...data.error });

    return action(data.data, event);
  }) as never;
}
