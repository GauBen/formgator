import { formfail, formgate } from "formgator/sveltekit";
import * as fg from "formgator";

export const actions = {
  default: formgate(
    {
      email: fg.email({ required: true }),
      password: fg.password({ required: true }),
    },
    async ({ email }, event) => {
      event.route satisfies { id: "/register" };

      if (email === "alice@example.com") {
        formfail({ email: "Account already exists" });
      }

      return { success: true as const, message: "Account created" };
    },
  ),
};
