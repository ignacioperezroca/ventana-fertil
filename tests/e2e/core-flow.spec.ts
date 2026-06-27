import { expect, test } from "@playwright/test";

test("guest can load the calculator and demo result", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Entendé tu ventana fértil/i })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("ventana-fertil:v1"))).not.toBeNull();
  await page.locator("#hero").getByRole("button", { name: "Ver demo" }).click();
  await expect(page.getByText("Demo cargada")).toBeVisible({ timeout: 2_000 });
  await expect(page.getByText("Día actual del ciclo")).toBeVisible();
});

test("account entry points and legal pages render", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Volvé a tu cuenta" })).toBeVisible();
  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: "Creá tu cuenta" })).toBeVisible();
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: "Privacidad" })).toBeVisible();
  await page.goto("/terms");
  await expect(page.getByRole("heading", { name: "Términos y límites" })).toBeVisible();
});

test("billing endpoints reject anonymous requests", async ({ request }) => {
  expect((await request.post("/api/stripe/checkout", { data: { plan: "monthly" } })).status()).toBe(401);
  expect((await request.post("/api/stripe/portal")).status()).toBe(401);
});
