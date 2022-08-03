import {
  _electron as electron,
  ElectronApplication,
  JSHandle,
  Page,
} from "playwright";
import { expect, test } from "@playwright/test";
import { glob } from "glob";
import { BrowserWindow } from "electron";

let electronApp: ElectronApplication;
let page: Page;
test.beforeEach(async () => {
  const files = glob.sync("**/app.asar");
  const main = files[0];
  console.log(files);
  electronApp = await electron.launch({
    args: [main],
  });
  electronApp.on("window", async (page) => {
    const filename = page.url()?.split("/").pop();
    console.log(`Window opened: ${filename}`);

    // capture errors
    page.on("pageerror", (error) => {
      console.error(error);
    });
    // capture console messages
    page.on("console", (msg) => {
      console.log(msg.text());
    });
  });
});

test.afterEach(async () => {
  await electronApp.close();
});

async function getChildWindowBounds(
  childWindowHandle: JSHandle<BrowserWindow>,
  mainWindowHandle: JSHandle<BrowserWindow>
) {
  const childWindowBounds = await childWindowHandle.evaluate(
    (bw: BrowserWindow) => bw.getContentBounds()
  );
  const mainWindowBounds = await mainWindowHandle.evaluate(
    (bw: BrowserWindow) => bw.getContentBounds()
  );

  const childWindowSize = [childWindowBounds.width, childWindowBounds.height];
  const childWindowPosition = [
    childWindowBounds.x - mainWindowBounds.x,
    childWindowBounds.y - mainWindowBounds.y,
  ];
  return { childWindowSize, childWindowPosition };
}

test("Opens the cascading menu in a new child window", async () => {
  page = await electronApp.firstWindow();
  // Open Cascading Menu
  await page.locator("data-testid=cascading-menu-trigger").click();
  expect(electronApp.windows().length).toBe(2);
  const cascadingMenuPage = electronApp.windows()[1];
  expect(cascadingMenuPage).toBeTruthy();

  await page.waitForTimeout(200);

  const cascadingMenuHandle = await electronApp.browserWindow(
    cascadingMenuPage
  );
  const mainWindowHandle = await electronApp.browserWindow(page);
  const { childWindowSize, childWindowPosition } = await getChildWindowBounds(
    cascadingMenuHandle,
    mainWindowHandle
  );

  expect(childWindowSize).toStrictEqual([201, 112]);
  expect(childWindowPosition).toStrictEqual([355, 36]);
});

test.skip("Opens multiple cascading menu windows", async () => {
  page = await electronApp.firstWindow();
  // Open Cascading Menu
  await page.locator("data-testid=cascading-menu-trigger").click();
  expect(electronApp.windows().length).toBe(2);
  const cascadingMenuPage = electronApp.windows()[1];
  expect(cascadingMenuPage).toBeTruthy();
  await cascadingMenuPage
    .locator("#UITK-cascading-menu-item-0 >> text=Level 1 Menu Item 2")
    .hover();
  await page.waitForTimeout(200);
  expect(electronApp.windows().length).toBe(3);
  const cascadingMenuLevel2 = electronApp.windows()[2];
  await cascadingMenuLevel2
    .locator("#UITK-cascading-menu-0-item-0 >> text=Level 2 Menu Item")
    .click();
  expect(electronApp.windows().length).toBe(1);
});

test("Opens the dialog in a new child window", async () => {
  page = await electronApp.firstWindow();

  // Open Dialog
  await page.locator("data-testid=dialog-button").click();
  expect(electronApp.windows().length).toBe(2);
  const dialogPage = electronApp.windows()[1];
  expect(dialogPage).toBeTruthy();

  await page.waitForTimeout(200);

  const dialogWindowHandle = await electronApp.browserWindow(dialogPage);
  const mainWindowHandle = await electronApp.browserWindow(page);

  expect(
    await dialogWindowHandle.evaluate((bw: BrowserWindow) => bw.title)
  ).toBe("example-1");

  const { childWindowSize, childWindowPosition } = await getChildWindowBounds(
    dialogWindowHandle,
    mainWindowHandle
  );

  expect(childWindowPosition).toStrictEqual([99, 144]);
  // catches an issue where the window starts off with the default size and then corrects itself
  expect(childWindowSize).toStrictEqual([501, 212]);
});

test("Opens the colour chooser in a new child window", async () => {
  page = await electronApp.firstWindow();
  // Open ColourChooser
  await page.locator("data-testid=color-chooser-overlay-button").click();
  expect(electronApp.windows().length).toBe(2);
  const colourPickerPage = electronApp.windows()[1];
  expect(colourPickerPage).toBeTruthy();
  // Will need to find a way to wait for event
  await page.waitForTimeout(200);

  const colourPickerHandle = await electronApp.browserWindow(colourPickerPage);
  const mainWindowHandle = await electronApp.browserWindow(page);

  const { childWindowSize, childWindowPosition } = await getChildWindowBounds(
    colourPickerHandle,
    mainWindowHandle
  );

  expect(childWindowPosition).toStrictEqual([391, 36]);

  expect(childWindowSize).toStrictEqual([458, 382]);

  //Click orange
  await colourPickerPage.locator("data-testid=swatch-#d65513").click();

  expect(electronApp.windows().length).toBe(1);
});

test("Opens the dropdown in a new child window", async () => {
  page = await electronApp.firstWindow();
  // Open Dropdown
  await page.locator("data-testid=dropdown").click();
  expect(electronApp.windows().length).toBe(2);
  const dropdownPage = electronApp.windows()[1];
  expect(dropdownPage).toBeTruthy();

  await page.waitForTimeout(200);

  const dropdownHandle = await electronApp.browserWindow(dropdownPage);
  const mainWindowHandle = await electronApp.browserWindow(page);

  // get positions of the windows to make sure they are in the right place relative to one another
  const { childWindowSize, childWindowPosition } = await getChildWindowBounds(
    dropdownHandle,
    mainWindowHandle
  );

  expect(childWindowPosition).toStrictEqual([175, 36]);
  expect(childWindowSize).toStrictEqual([181, 363]);

  // Click Colorado
  await dropdownPage.locator("text=Colorado").click();

  expect(electronApp.windows().length).toBe(1);
});

test("Opens the tooltip", async () => {
  page = await electronApp.firstWindow();
  // Open tooltip
  await page.locator("data-testid=tooltip-trigger").hover();

  await electronApp.waitForEvent("window");
  expect(electronApp.windows().length).toBe(2);
  const toolTipPage = electronApp.windows()[1];
  expect(toolTipPage).toBeTruthy();

  const toolTipHandle = await electronApp.browserWindow(toolTipPage);
  const mainWindowHandle = await electronApp.browserWindow(page);

  await page.waitForTimeout(200);
  // get positions of the windows to make sure they are in the right place relative to one another
  const { childWindowSize, childWindowPosition } = await getChildWindowBounds(
    toolTipHandle,
    mainWindowHandle
  );

  // Catches an issue where the window starts off with the default size and then corrects itself
  expect(childWindowSize).toStrictEqual([109, 51]);
  expect(childWindowPosition).toStrictEqual([68, 25]);

  // Hover on something else
  await page.locator("data-testid=cascading-menu-trigger").hover();

  await page.waitForTimeout(100);
  expect(electronApp.windows().length).toBe(1);
});

test.skip("Opens the toolbar", async () => {
  page = await electronApp.firstWindow();
  // Open toolbar
  await page.locator("data-testid=toolbar-trigger").click();

  expect(electronApp.windows().length).toBe(2);
  const toolbarPage = electronApp.windows()[1];
  expect(toolbarPage).toBeTruthy();

  const toolTipHandle = await electronApp.browserWindow(toolbarPage);
  const mainWindowHandle = await electronApp.browserWindow(page);

  await page.waitForTimeout(200);
  const { childWindowSize, childWindowPosition } = await getChildWindowBounds(
    toolTipHandle,
    mainWindowHandle
  );

  expect(childWindowSize).toStrictEqual([719, 129]);
  expect(childWindowPosition).toStrictEqual([189, 64]);
  const toolboxHandle = await toolbarPage
    .locator("data-testid=toolbar-handle")
    .elementHandle();
  // @ts-ignore
  const toolbarHandlebox = await toolboxHandle.boundingBox();

  // @ts-ignore
  await toolboxHandle.hover();
  await page.mouse.down();
  // @ts-ignore
  await page.mouse.move(toolbarHandlebox.x, toolbarHandlebox.y + 100);
  await page.mouse.up();

  const {
    childWindowSize: childWindowSizeAfterDrag,
    childWindowPosition: childWindowPositionAfterDrag,
  } = await getChildWindowBounds(toolTipHandle, mainWindowHandle);

  expect(childWindowSizeAfterDrag).toStrictEqual([719, 129]);
  expect(childWindowPositionAfterDrag).toStrictEqual([189, 64]);
});
