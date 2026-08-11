import { chromium } from "playwright";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const ADMIN_EMAIL = process.env.SMOKE_ADMIN_EMAIL ?? "admin@starseerker.cl";
const ADMIN_PASSWORD = process.env.SMOKE_ADMIN_PASSWORD ?? "cambia-esta-clave";
const log = (...a) => console.log("•", ...a);

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("response", (r) => {
  if (r.status() >= 500) errors.push(`${r.status()} ${r.url()}`);
});

// 1. Login admin
await page.goto(`${BASE}/admin`);
await page.fill('input[name="email"]', ADMIN_EMAIL);
await page.fill('input[name="password"]', ADMIN_PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL("**/admin");
log("login ok →", page.url());

// 2. Crear producto
await page.goto(`${BASE}/admin/productos/nuevo`);
await page.fill('input[name="name"]', "Producto de prueba QA");
await page.fill('input[name="sku"]', "QA-001");
await page.fill('input[name="price"]', "119990");
await page.fill('input[name="stock"]', "4");
await page.fill('textarea[name="highlights"]', "Bullet uno\nBullet dos");
await page.fill('textarea[name="specs"]', "Peso: 1 kg\nColor: negro");
await page.click('button:has-text("Crear producto")');
await page.waitForURL("**/admin/productos");
log("producto creado:", await page.locator("text=Producto de prueba QA").count());

// 3. Aparece en la tienda
await page.goto(`${BASE}/productos`);
log("visible en catálogo:", await page.locator("text=Producto de prueba QA").count());

// 4. Ficha de producto + agregar al carrito
await page.goto(`${BASE}/producto/producto-de-prueba-qa`);
log("ficha:", await page.locator("h1").innerText(), "|", await page.locator("text=Bullet uno").count());
await page.click('button:has-text("Agregar al carrito")');
await page.waitForSelector('text=Finalizar compra');
log("carrito abierto ok");

// 5. Checkout: cotizar despacho
await page.goto(`${BASE}/checkout`);
await page.fill('input[type="email"]', "qa@test.cl");
await page.selectOption('select >> nth=0', "RM");
await page.waitForSelector('text=Despacho estándar', { timeout: 10000 });
log("opciones de despacho cargadas");
log("resumen:", (await page.locator("aside dl").innerText()).replace(/\n/g, " | "));

// 6. Cupón
await page.fill('input[placeholder="SS10"]', "BIENVENIDA10");
await page.click('button:has-text("Aplicar")');
await page.waitForSelector("text=10% de descuento", { timeout: 8000 });
log("cupón aplicado");

// 7. Admin: crear zona de envío
await page.goto(`${BASE}/admin/envios`);
const zoneForms = await page.locator("form").count();
log("página de envíos ok, formularios:", zoneForms);

// 8. Ajustes
await page.goto(`${BASE}/admin/ajustes`);
await page.fill('input[name="announcement"]', "QA: envío gratis sobre $150.000");
await page.click('button:has-text("Guardar ajustes")');
await page.waitForTimeout(1500);
await page.goto(BASE);
log("anuncio en tienda:", await page.locator("text=QA: envío gratis").count());

// 9. Contacto
await page.goto(`${BASE}/contacto`);
await page.fill('input[name="name"]', "QA Tester");
await page.fill('input[name="email"]', "qa@test.cl");
await page.fill('textarea[name="message"]', "Mensaje de prueba automatizada para el formulario.");
await page.click('button:has-text("Enviar mensaje")');
await page.waitForSelector("text=Mensaje enviado", { timeout: 8000 });
log("contacto ok");

// 10. Newsletter
await page.goto(BASE);
await page.fill('input[placeholder="tu@correo.cl"]', "qa-news@test.cl");
await page.click('button:has-text("Suscribirme")');
await page.waitForSelector("text=Revisa tu correo", { timeout: 8000 });
log("newsletter ok");

console.log(errors.length ? "\n❌ ERRORES:\n" + errors.join("\n") : "\n✅ Sin errores 5xx ni excepciones de cliente");
await browser.close();
