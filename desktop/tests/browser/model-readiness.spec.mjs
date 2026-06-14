import { expect, test } from "@playwright/test";

test("home surface shows first-run setup and pinned local model readiness", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Work that needs attention" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "City Core setup checklist" })).toBeVisible();
  await expect(page.getByText(/No Docker, WSL, terminal, or developer tooling is part of the clerk path\./)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Gemma 4 12B QAT Q4_0" })).toBeVisible();
  await expect(page.getByText("No silent download starts from this screen.")).toBeVisible();
  await expect(page.getByText("faff1a63667fac17ac5e777f47114688fcefea96e220e211aaa8d62c2c4561f1")).toBeVisible();
  await expect(page.getByText("hf.co/google/gemma-4-12B-it-qat-q4_0-gguf:Q4_0")).toBeVisible();
  await expect(page.getByText("Download progress")).toBeVisible();
  await expect(page.getByText("No verified or partial Gemma model download is saved on this machine.")).toBeVisible();
  await expect(page.getByText("Needs verification")).toBeVisible();
  await expect(page.getByRole("button", { name: "Open Model Folder" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Download / Resume" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Verify Checksum" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry Setup" })).toBeVisible();
  await expect(page.getByText("4 local components are part of this Windows profile.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "CivicCore" })).toBeVisible();

  await expect(page.getByText("Start Docker")).toHaveCount(0);
  await expect(page.getByText("Install WSL")).toHaveCount(0);
});

test("browser preview explains model actions require the desktop bridge", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Verify Checksum" }).click();

  await expect(page.getByText("Desktop app required")).toBeVisible();
  await expect(page.getByText("Model setup changes are saved by the Windows desktop app, not the browser preview.")).toBeVisible();
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
  await expect(page.getByRole("heading", { name: "Backup, Restore, Uninstall" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "City data folder" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Backup folder" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Task queue schema" })).toBeVisible();
  await expect(page.getByText("City workflow services are not running yet")).toBeVisible();
  await expect(page.locator('[aria-label="City data folder actions"]')).toHaveCount(0);
  await expect(page.locator('[aria-label="Backup folder actions"]')).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Backup Now" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open Backup Folder" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Support Bundle" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Restore Latest Backup" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Prepare Uninstall" })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Install$/ }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /^Start$/ }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /^Repair$/ }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /^Logs$/ }).first()).toBeVisible();
});

test("browser preview explains supervisor actions require the desktop bridge", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /System Health/ }).click();
  await page.getByRole("button", { name: "Open Backup Folder" }).click();

  await expect(page.getByText("Desktop app required")).toBeVisible();
  await expect(page.getByText("Runtime service changes are saved by the Windows desktop app, not the browser preview.")).toBeVisible();

  await page.getByRole("button", { name: "Backup Now" }).click();

  await expect(page.getByRole("heading", { name: "Review Before Backing Up Local Profile" })).toBeVisible();
  await expect(page.getByText("What will change")).toBeVisible();
  await expect(page.getByText("Sources and evidence")).toBeVisible();
  await expect(page.getByRole("button", { name: "Confirm Backup Now" })).toBeVisible();
  await expect(page.getByText("Desktop app required")).toHaveCount(0);

  await page.getByRole("button", { name: "Confirm Backup Now" }).click();
  await expect(page.getByText("Desktop app required")).toBeVisible();
  await expect(page.getByText("Runtime service changes are saved by the Windows desktop app, not the browser preview.")).toBeVisible();
});

test("system health repair and uninstall actions require guided review", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /System Health/ }).click();

  await page.getByRole("button", { name: /^Repair$/ }).first().click();
  await expect(page.getByRole("heading", { name: "Review Before Repairing Local data store" })).toBeVisible();
  await expect(page.getByText("Rechecks portable runtime files")).toBeVisible();
  await page.getByRole("button", { name: "Cancel Review" }).click();
  await expect(page.getByRole("heading", { name: "Review Before Repairing Local data store" })).toHaveCount(0);

  await page.getByRole("button", { name: /^Stop$/ }).first().click();
  await expect(page.getByRole("heading", { name: "Review Before Stopping Local data store" })).toBeVisible();
  await expect(page.getByText("Staff workflows may be unavailable until services restart.")).toBeVisible();
  await page.getByRole("button", { name: "Cancel Review" }).click();

  await page.getByRole("button", { name: "Create Support Bundle" }).click();
  await expect(page.getByRole("heading", { name: "Review Before Creating Support Bundle" })).toBeVisible();
  await expect(page.getByText("health, runtime-state, and selected service logs")).toBeVisible();
  await expect(page.getByText("does not copy city records")).toBeVisible();
  await expect(page.getByRole("button", { name: "Confirm Create Support Bundle" })).toBeVisible();
  await page.getByRole("button", { name: "Cancel Review" }).click();

  await page.getByRole("button", { name: "Prepare Uninstall" }).click();
  await expect(page.getByRole("heading", { name: "Review Before Preparing Uninstall" })).toBeVisible();
  await expect(page.getByText("final-uninstall backup")).toBeVisible();
  await expect(page.getByRole("button", { name: "Open Windows Uninstall" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Confirm Prepare Uninstall" })).toBeVisible();
});
