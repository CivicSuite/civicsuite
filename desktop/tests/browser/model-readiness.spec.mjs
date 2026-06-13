import { expect, test } from "@playwright/test";

test("home surface shows first-run setup and pinned local model readiness", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Work that needs attention" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "City Core setup checklist" })).toBeVisible();
  await expect(page.getByText("No Docker, WSL, terminal, or developer tooling is part of the clerk path.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Gemma 4 12B QAT Q4_0" })).toBeVisible();
  await expect(page.getByText("No silent download starts from this screen.")).toBeVisible();
  await expect(page.getByText("faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1")).toBeVisible();
  await expect(page.getByText("hf.co/google/gemma-4-12B-it-qat-q4_0-gguf:Q4_0")).toBeVisible();
  await expect(page.getByText("Needs verification")).toBeVisible();
  await expect(page.getByText("4 local components are part of this Windows profile.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "CivicCore" })).toBeVisible();

  await expect(page.getByText("Start Docker")).toHaveCount(0);
  await expect(page.getByText("Install WSL")).toHaveCount(0);
});

test("system health keeps full model readiness visible", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /System Health/ }).click();

  await expect(page.getByRole("heading", { name: "System Health" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Gemma 4 12B QAT Q4_0" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Local model file" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Checksum verification" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Local model runtime" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "CivicCore model registry" })).toBeVisible();
  await expect(page.getByText("explicit setup consent required")).toBeVisible();
});
