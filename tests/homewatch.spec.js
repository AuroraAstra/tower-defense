const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("level screen exposes profile save controls", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "家园守望" })).toBeVisible();
  await expect(page.getByRole("button", { name: "导出存档" })).toBeVisible();
  await expect(page.getByRole("button", { name: "导入存档" })).toBeVisible();
  await expect(page.getByRole("button", { name: /继续第/ })).toBeVisible();
});

test("can enter a run and open debug tools", async ({ page }) => {
  await page.getByRole("button", { name: /继续第/ }).click();
  await page.getByRole("button", { name: "开始守望" }).click();
  await expect(page.locator("#game")).toBeVisible();
  await page.getByRole("button", { name: "调试" }).click();
  await expect(page.getByRole("heading", { name: "调试入口" })).toBeVisible();
  await page.getByRole("button", { name: "金币 +500" }).click();
  await expect(page.locator("#coinStat")).not.toHaveText("0");
});

test("mobile bottom tabs switch hud panels", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: /继续第/ }).click();
  await page.getByRole("button", { name: "开始守望" }).click();
  await expect(page.getByRole("navigation", { name: "移动端底部标签" })).toBeVisible();
  await page.getByRole("button", { name: "任务" }).click();
  await expect(page.locator(".challenge-panel")).toBeVisible();
  await page.getByRole("button", { name: "操作" }).click();
  await expect(page.locator(".combat-panel")).toBeVisible();
});

test("props are reachable from nearby level-one bottle towers", async ({ page }) => {
  const unreachableProps = await page.evaluate(() => {
    const baseRange = towerTypes.bottle.range;
    const canvasSize = { width: 1200, height: 720 };
    return levels.flatMap((level, levelIndex) =>
      level.props
        .map((prop, propIndex) => {
          const propPoint = { x: prop.at[0] * canvasSize.width, y: prop.at[1] * canvasSize.height };
          const nearest = Math.min(
            ...level.build.map(([x, y]) =>
              Math.hypot(propPoint.x - x * canvasSize.width, propPoint.y - y * canvasSize.height),
            ),
          );
          return { level: levelIndex + 1, prop: propIndex + 1, nearest };
        })
        .filter(({ nearest }) => nearest > baseRange),
    );
  });

  expect(unreachableProps).toEqual([]);
});
