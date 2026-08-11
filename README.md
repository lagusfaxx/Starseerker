# STARSEEKER Chile — starseerker.cl

Tienda online del distribuidor oficial de STARSEEKER en Chile. Next.js 16 (App Router) +
PostgreSQL + Prisma, con pagos por **Mercado Pago**, correos transaccionales con **Resend**
y un panel de administración propio con **despachos configurables por región**.

---

## Qué incluye

**Tienda**

- Portada con video de fondo configurable, colecciones, destacados, nuevos y más vendidos.
- Catálogo con filtros (nuevos / más vendidos / ofertas), orden por precio, "solo con stock" y paginación.
- Buscador de productos.
- Ficha de producto con galería, bullets, ficha técnica, datos de garantía, JSON-LD para Google
  y **calculadora de despacho por región** antes de comprar.
- Carrito persistente (localStorage, sincronizado entre pestañas) con drawer lateral y barra de
  progreso hacia el envío gratis.
- Checkout en una página: datos, región + comuna (las 16 regiones y sus comunas), opciones de
  despacho reales, cupón de descuento y pago con Mercado Pago.
- Seguimiento de pedido sin cuenta (número + correo, o enlace con token).
- Centro de ayuda, despachos, devoluciones, garantía, medios de pago, contacto, nosotros,
  términos y privacidad — redactados para el mercado chileno (Ley 19.496, retracto de 10 días).
- `sitemap.xml` y `robots.txt` generados desde la base de datos.

**Panel de administración** (`/admin`)

- Resumen: ventas de hoy, últimos 30 días, pedidos pendientes, stock bajo.
- Pedidos: filtros por estado, búsqueda, cambio de estado, courier + número de seguimiento,
  correo automático de "pedido despachado" y notas internas con historial.
- Productos: alta/edición completa (precio, stock, imágenes, bullets, ficha técnica, SEO,
  destacados) y categorías.
- **Envíos por región**: zonas que agrupan regiones + tarifas por zona (precio, envío gratis
  sobre X, plazos, rangos de subtotal, retiro en tienda). Avisa si alguna región queda sin cobertura.
- Cupones: porcentaje, monto fijo o envío gratis, con vigencia, mínimo de compra y límite de usos.
- Mensajes de contacto y lista de suscriptores.
- Ajustes de la tienda (identidad, portada, barra de anuncios, umbral de envío gratis).

---

## Puesta en marcha

```bash
npm install
cp .env.example .env      # completa las variables
npm run db:deploy         # aplica las migraciones
npm run db:seed           # admin, categorías, productos demo y zonas de envío
npm run dev
```

- Tienda: http://localhost:3000
- Panel: http://localhost:3000/admin (usa `ADMIN_EMAIL` / `ADMIN_PASSWORD` del seed)

### Variables de entorno

| Variable | Para qué sirve |
| --- | --- |
| `DATABASE_URL` | PostgreSQL (Neon, Supabase, RDS, etc.). |
| `NEXT_PUBLIC_SITE_URL` | URL pública; se usa en correos, JSON-LD y retornos de Mercado Pago. |
| `AUTH_SECRET` | Firma la sesión del panel. `openssl rand -base64 48`. |
| `MP_ACCESS_TOKEN` | Access token de producción de tu cuenta Mercado Pago Chile. |
| `MP_WEBHOOK_SECRET` | Clave de firma del webhook (panel de MP → Notificaciones). |
| `RESEND_API_KEY` | API key de Resend. |
| `RESEND_FROM` | Remitente verificado, ej. `STARSEEKER Chile <hola@starseerker.cl>`. |
| `ORDER_NOTIFICATION_EMAIL` | Quién recibe el aviso de venta (separar con comas). |

Sin `RESEND_API_KEY` la tienda funciona igual: los correos se omiten y quedan en el log.

---

## Mercado Pago

Se usa **Checkout Pro**: el checkout crea el pedido, genera una preferencia y redirige a
Mercado Pago. Nada de datos de tarjeta pasa por el sitio.

1. En el panel de Mercado Pago crea una aplicación y copia el **access token de producción**.
2. En *Webhooks / Notificaciones*, registra
   `https://starseerker.cl/api/webhooks/mercadopago` para el evento **Pagos** y copia la
   clave secreta en `MP_WEBHOOK_SECRET`.
3. El webhook verifica la firma `x-signature`, consulta el pago a la API, actualiza el pedido,
   **descuenta el stock**, registra el uso del cupón y dispara los correos. Es idempotente:
   una notificación repetida no descuenta stock dos veces.

Los precios se manejan como enteros en CLP (moneda sin decimales).

---

## Despachos configurables

El modelo es **zona → tarifas**:

- Una **zona** agrupa uno o más códigos de región (`RM`, `V`, `VIII`, …).
- Cada zona tiene una o más **tarifas** con precio, umbral de envío gratis, plazo en días
  hábiles, rango de subtotal en que aplica y la opción "retiro en tienda" (no pide dirección).

En el checkout el cliente elige su región, el servidor cotiza contra esa configuración y
**revalida la tarifa elegida antes de cobrar**: nunca se confía en el precio que envía el navegador.

El seed deja cinco zonas cubriendo las 16 regiones (RM, centro, norte, sur y zonas extremas).

---

## Seguridad del checkout

- Precios, stock y totales se recalculan siempre en el servidor (`src/lib/cart.ts`).
- La tarifa de despacho se revalida contra la configuración vigente (`src/lib/shipping.ts`).
- Los cupones se validan en el servidor: vigencia, mínimo, límite de usos.
- Si Mercado Pago falla al crear la preferencia, el pedido se descarta para no dejar
  registros huérfanos.
- El panel está protegido por `proxy.ts` (JWT en cookie httpOnly) y además cada server action
  vuelve a exigir sesión.

---

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` / `npm start` | Build y arranque en producción. |
| `npm run db:deploy` | Aplica migraciones (producción). |
| `npm run db:migrate` | Crea una migración nueva (desarrollo). |
| `npm run db:seed` | Datos iniciales. |
| `npm run db:studio` | Prisma Studio. |
| `npm run smoke` | Prueba de humo end-to-end con Playwright sobre una instancia levantada. |

---

## Despliegue

Pensado para Vercel + PostgreSQL administrado:

1. Crea la base de datos y carga las variables de entorno del proyecto.
2. `npm run db:deploy` (y `npm run db:seed` la primera vez).
3. Apunta `starseerker.cl` al proyecto y define `NEXT_PUBLIC_SITE_URL=https://starseerker.cl`.
4. Registra el webhook de Mercado Pago con el dominio definitivo.
5. Verifica el dominio del remitente en Resend (SPF + DKIM) para que los correos no caigan en spam.
