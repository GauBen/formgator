import * as fg from "formgator";
import { loadgate } from "formgator/sveltekit";
import type { PageLoad } from "./$types.js";

export const load = loadgate(
  {
    page: fg.number({ min: 1, required: true }).optional(1),
    search: fg.search().trim().optional(),
  },
  (data) => data,
) satisfies PageLoad;
