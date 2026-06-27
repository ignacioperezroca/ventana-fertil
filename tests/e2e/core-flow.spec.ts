import { expect, test } from "@playwright/test";

test("guest can load the calculator and demo result", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Ventana fértil estimada, lista para mover y explorar.")).toBeVisible();
  await page.getByRole("button", { name: "Ver ejemplo" }).first().click();
  await expect(page.getByText("Modo demo", { exact: true })).toBeVisible();
  await expect(page.getByText("Tu ventana fértil estimada", { exact: true })).toBeVisible();
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
