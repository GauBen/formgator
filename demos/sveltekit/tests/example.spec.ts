import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

test("correct form is accepted", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading")).toContainText("Create a new post");
  await page.getByLabel("Title").fill("Hello World!");
  await page.getByLabel("Publication date").fill("2024-12-12T15:00");
  await page.getByLabel("Tags").selectOption(["Svelte", "GitHub"]);

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByText("Banner image").click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(fileURLToPath(import.meta.resolve("./playwright.png")));

  await page.getByLabel("Send to newsletter subscribers").uncheck();
  await page.getByPlaceholder("Once upon a time...").fill("Welcome to my blog :)");
  await page.getByRole("button", { name: "Publish!" }).click();
  await expect(page.locator("form")).toContainText("Post successfully created");
});
