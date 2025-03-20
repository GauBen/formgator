/// @ts-check
/// <reference types="@chachalog/types" />
import fs from "node:fs";
import { defineConfig } from "chachalog";
import github from "chachalog/github";
import yarn from "chachalog/yarn";

export default defineConfig(() => ({
  allowedBumps: ["patch", "minor", "major"],
  platform: github(),
  managers: [
    yarn(),
    {
      setVersion(pkg, version) {
        if (pkg.name !== "formgator") return;
        const updated = fs
          .readFileSync("jsr.json", "utf8")
          .replace(/"version": ".+"/, `"version": "${version}"`);
        fs.writeFileSync("jsr.json", updated);
      },
    },
  ],
}));
