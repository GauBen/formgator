import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  // formgator has its own copy of sveltekit, so we need to dedupe it
  resolve: { dedupe: ["@sveltejs/kit"] },
});
