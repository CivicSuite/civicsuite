import { expect, test } from "@playwright/test";

test("city workflow pages expose real local task controls", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Meetings & Notices/ }).click();
  await expect(page.getByRole("heading", { name: "Prepare Meeting" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Meeting" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Code Handoff" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Mark Notice Ready" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Export Packet" })).toBeVisible();
  await expect(page.getByText("No local meetings have been created yet.")).toBeVisible();
  await expect(page.getByText("No CivicCode handoffs are waiting for the clerk.")).toBeVisible();

  await page.getByRole("button", { name: /Records Requests/ }).click();
  await expect(page.getByRole("heading", { name: "Request Intake" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Request" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Export Response" })).toBeVisible();

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

test("module manager presents the installed city-core package", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Settings/ }).click();

  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "City Profile" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "First Admin" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save City Profile" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save First Admin" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "City Core Modules" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "City Core Package" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Module Slots" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "CivicCore" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "CivicRecords AI" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "CivicClerk" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "CivicCode" })).toBeVisible();
  await expect(page.getByText("Not ready")).toHaveCount(0);
  await expect(page.getByText("Scaffold")).toHaveCount(0);
});
