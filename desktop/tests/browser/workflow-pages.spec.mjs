import { expect, test } from "@playwright/test";

test("city workflow pages expose real local task controls", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Meetings & Notices/ }).click();
  await expect(page.getByRole("heading", { name: "Prepare Meeting" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Meeting" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Code Handoff" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Mark Notice Ready" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Export Packet" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open Exports Folder" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Action Item" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Record Resident Comment" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Adopt Minutes" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Archive Public Record" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Public Comment Review" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Mark Reviewed" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Redact Comment" })).toBeDisabled();
  await expect(page.getByText("No local meetings have been created yet.")).toBeVisible();
  await expect(page.getByText("No CivicCode handoffs are waiting for the clerk.")).toBeVisible();

  await page.getByRole("button", { name: /Records Requests/ }).click();
  await expect(page.getByRole("heading", { name: "Request Intake" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Request" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Scope & Search" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Assign" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Request Clarification" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Record Search" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Exemption Review" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Estimate Fee" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Response & Release" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve Response" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Export Response" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Mark Fulfilled" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Close Request" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open Exports Folder" })).toBeVisible();

  await page.getByRole("button", { name: /Code & Ordinances/ }).click();
  await expect(page.getByRole("heading", { name: "Import Code Source" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Import Source" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Publish Source", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Unpublish Source", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open Exports Folder" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Codifier Sync" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Record Sync", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Record Sync Failure" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry Sync" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Mark Stale" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Guidance & Summary" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save Guidance Draft" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve Guidance" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Clerk Handoff" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ask Code Question" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Answer Code Question" })).toBeVisible();

  await page.getByRole("button", { name: /Search City Knowledge/ }).click();
  await expect(page.getByRole("heading", { name: "Local Search" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Search Local Data" })).toBeVisible();
  await expect(page.getByText("No local search results yet.")).toBeVisible();
  await expect(page.locator("main").getByText("Scaffold")).toHaveCount(0);
});

test("resident public surface hides staff workflow controls", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("tab", { name: "Resident/Public" }).click();

  await page.getByRole("button", { name: /Meetings & Notices/ }).click();
  await expect(page.getByRole("heading", { name: "Public Meeting Materials" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Submit Public Comment" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit Public Comment" })).toBeDisabled();
  await expect(page.getByText("No posted public meeting is open for comment")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Prepare Meeting" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Public Comment Review" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Redact Comment" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Create Meeting" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Add Code Handoff" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Archive Public Record" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open Exports Folder" })).toHaveCount(0);

  await page.getByRole("button", { name: /Records Requests/ }).click();
  await expect(page.getByRole("heading", { name: "Public Records Requests" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Submit Public Records Request" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit Records Request" })).toBeVisible();
  await expect(page.getByLabel("Request number")).toBeVisible();
  await expect(page.getByLabel("Submitted contact")).toBeVisible();
  await expect(page.getByRole("button", { name: "Check Request Status" })).toBeVisible();
  await expect(page.getByText("Pending public intake appears only after the request number and submitted contact match.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Request Intake" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Create Request" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Approve Response" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Export Response" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Mark Fulfilled" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open Exports Folder" })).toHaveCount(0);
  await page.getByLabel("Your name").fill("Morgan Lee");
  await page.getByLabel("Email or phone").fill("morgan@example.gov");
  await page.getByLabel("Records requested").fill("Emails and invoices about the river trail grant");
  await page.getByRole("button", { name: "Submit Records Request" }).click();
  await expect(page.getByText("Desktop app required")).toBeVisible();

  await page.getByRole("button", { name: /Code & Ordinances/ }).click();
  await expect(page.getByRole("heading", { name: "Municipal Code Search" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ask the Code" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Answer Code Question" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Import Code Source" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Import Source" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Publish Source", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Unpublish Source", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Record Sync", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Approve Guidance" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Create Clerk Handoff" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open Exports Folder" })).toHaveCount(0);

  await page.getByRole("button", { name: /Search City Knowledge/ }).click();
  await expect(page.getByRole("heading", { name: "Public Search" })).toBeVisible();
  await expect(page.getByText("No public search results yet.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Local Search" })).toHaveCount(0);
  await expect(page.getByText("No local search results yet.")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Search Local Data" })).toHaveCount(0);
});

test("risky city workflow actions require guided review before mutation", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Meetings & Notices/ }).click();
  await page.getByRole("button", { name: "Archive Public Record" }).click();
  await expect(page.getByRole("heading", { name: "Review Before Archiving Public Record" })).toBeVisible();
  await expect(page.getByText("What will change")).toBeVisible();
  await expect(page.getByText("Who can see it")).toBeVisible();
  await expect(page.getByText("Sources and evidence")).toBeVisible();
  await expect(page.getByRole("button", { name: "Confirm Archive Public Record" })).toBeVisible();
  await expect(page.getByText("Desktop app required")).toHaveCount(0);

  await page.getByRole("button", { name: "Cancel Review" }).click();
  await expect(page.getByRole("heading", { name: "Review Before Archiving Public Record" })).toHaveCount(0);

  await page.getByRole("button", { name: "Mark Notice Ready" }).click();
  await expect(page.getByRole("heading", { name: "Review Before Posting Notice" })).toBeVisible();
  await page.getByRole("button", { name: "Confirm Mark Notice Ready" }).click();
  await expect(page.getByText("Desktop app required")).toBeVisible();

  await page.getByRole("button", { name: /Records Requests/ }).click();
  await page.getByRole("button", { name: "Approve Response" }).click();
  await expect(page.getByRole("heading", { name: "Review Before Approving Records Response" })).toBeVisible();
  await expect(page.getByText("Internal staff status changes to human-approved")).toBeVisible();

  await page.getByRole("button", { name: /Code & Ordinances/ }).click();
  await page.getByRole("button", { name: "Publish Source", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Review Before Publishing Code Source" })).toBeVisible();
  await expect(page.getByText("Creates CivicCode audit and CivicCore publication-gate entries.")).toBeVisible();
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
  await expect(page.getByRole("heading", { name: "Publication Gates" })).toBeVisible();
  await expect(page.getByText("No human-approved public records have been published yet.")).toBeVisible();
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
  await expect(page.getByLabel("Local passcode")).toBeVisible();
  await expect(page.getByRole("heading", { name: "City Core Modules" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Choose Product Modules" })).toBeVisible();
  await expect(page.getByLabel(/City Core/)).toBeChecked();
  await expect(page.locator('[data-module-toggle="civicrecords-ai"]')).toBeChecked();
  await expect(page.locator('[data-module-toggle="civicclerk"]')).toBeChecked();
  await expect(page.locator('[data-module-toggle="civiccode"]')).toBeChecked();
  await expect(page.locator('[data-module-toggle="civiczone"]')).toBeDisabled();
  await expect(page.getByText("Not ready for Windows Local 1.0")).toBeVisible();
  await page.getByLabel(/Custom/).check();
  await expect(page.getByText("Custom selection will install CivicCore plus 3 selected product modules.")).toBeVisible();
  await page.locator('[data-module-toggle="civicrecords-ai"]').uncheck();
  await expect(page.getByText("Custom selection will install CivicCore plus 2 selected product modules.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Apply Module Selection" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "City Core Package" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Package Profiles" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Module Catalog" })).toBeVisible();
  await expect(page.getByText("Selected profile: City Core. Installed modules: 4.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "CivicCore" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "CivicRecords AI" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "CivicClerk" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "CivicCode" })).toBeVisible();
  await expect(page.getByText("Installed by selected package profile").first()).toBeVisible();
  await expect(page.getByText("Updated through the versioned module manifest").first()).toBeVisible();
  await expect(page.getByText("Allowed after a backup is created").first()).toBeVisible();
  await expect(page.getByText("Removed only after module data backup").first()).toBeVisible();
  await expect(page.getByText("backup-first-module-data-removal")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Full Suite" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "CivicZone" })).toBeVisible();
  await expect(page.getByText("Package waiting")).toBeVisible();
  await expect(page.getByText("Scaffold")).toHaveCount(0);
});
