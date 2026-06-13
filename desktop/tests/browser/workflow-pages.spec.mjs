import { expect, test } from "@playwright/test";

test("city workflow pages expose real local task controls", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Meetings & Notices/ }).click();
  await expect(page.getByRole("heading", { name: "Prepare Meeting" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Meeting" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Mark Notice Ready" })).toBeVisible();
  await expect(page.getByText("No local meetings have been created yet.")).toBeVisible();

  await page.getByRole("button", { name: /Records Requests/ }).click();
  await expect(page.getByRole("heading", { name: "Request Intake" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Request" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Record Export" })).toBeVisible();

  await page.getByRole("button", { name: /Code & Ordinances/ }).click();
  await expect(page.getByRole("heading", { name: "Import Code Source" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Import Source" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Clerk Handoff" })).toBeVisible();

  await page.getByRole("button", { name: /Search City Knowledge/ }).click();
  await expect(page.getByRole("heading", { name: "Local Search" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Search Local Data" })).toBeVisible();
  await expect(page.locator("main").getByText("Scaffold")).toHaveCount(0);
});

test("browser preview refuses persistent city workflow mutations", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Meetings & Notices/ }).click();
  await page.getByRole("button", { name: "Create Meeting" }).click();

  await expect(page.getByText("Desktop app required")).toBeVisible();
  await expect(page.getByText("City workflow changes are saved by the Windows desktop app, not the browser preview.")).toBeVisible();
});

test("audit drawer uses local workflow audit language instead of placeholder text", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Audit Trail" }).click();

  await expect(page.getByRole("heading", { name: "Audit Trail" })).toBeVisible();
  await expect(page.getByText("No local workflow actions have been recorded yet.")).toBeVisible();
  await expect(page.getByText("Scaffold")).toHaveCount(0);
});
