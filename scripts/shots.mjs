import { chromium } from "playwright";

const BASE = process.env.SHOT_BASE_URL ?? "http://localhost:3000";
const OUT = process.env.SHOT_DIR ?? "/tmp/shots";
const SLUG = process.env.SHOT_PRODUCT ?? "starseeker-e55pro-molino-electrico";

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

async function shot(name, { full = true } = {}) {
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
  console.log("•", name);
}

for (const [name, path] of [
  ["home", "/"],
  ["catalogo", "/productos"],
  ["producto", `/producto/${SLUG}`],
  ["ayuda", "/ayuda"],
]) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await shot(name, { full: name !== "home" });
}

// Con productos en el carrito: cajón lateral, carrito y checkout.
await page.goto(`${BASE}/producto/${SLUG}`, { waitUntil: "networkidle" });
await page.click('button:has-text("Agregar al carrito")');
await page.waitForSelector('text=Finalizar compra');
await shot("carrito-drawer", { full: false });

await page.goto(`${BASE}/carrito`, { waitUntil: "networkidle" });
await shot("carrito");

await page.goto(`${BASE}/checkout`, { waitUntil: "networkidle" });
await page.selectOption("select >> nth=0", "RM").catch(() => {});
await page.waitForTimeout(900);
await shot("checkout");

await page.setViewportSize({ width: 390, height: 844 });
for (const [name, path] of [
  ["movil-home", "/"],
  ["movil-catalogo", "/productos"],
  ["movil-producto", `/producto/${SLUG}`],
]) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await shot(name, { full: false });
}

await browser.close();
