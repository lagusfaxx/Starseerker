export type ContentSection = { heading: string; body: string[] };
export type ContentPage = {
  slug: string;
  title: string;
  summary: string;
  sections: ContentSection[];
};

export const HELP_PAGES: ContentPage[] = [
  {
    slug: "despachos",
    title: "Despachos y plazos",
    summary: "Cuánto cuesta y cuánto demora tu pedido según la región de destino.",
    sections: [
      {
        heading: "Cobertura nacional",
        body: [
          "Despachamos a las 16 regiones de Chile a través de couriers con seguimiento. El costo exacto para tu comuna se calcula en el checkout: elige tu región y verás las opciones disponibles con su plazo estimado antes de pagar.",
          "Los plazos se cuentan en días hábiles desde que el pago queda acreditado, no desde que se genera el pedido.",
        ],
      },
      {
        heading: "Preparación del pedido",
        body: [
          "Los pedidos pagados antes de las 14:00 h de un día hábil se preparan el mismo día. Después de ese horario, al día hábil siguiente.",
          "Cuando el pedido sale de bodega recibes un correo con el courier y el número de seguimiento.",
        ],
      },
      {
        heading: "Retiro en tienda",
        body: [
          "Si está habilitado para tu compra, puedes elegir retiro en tienda sin costo en el checkout. Te avisamos por correo cuando el pedido esté listo; para retirarlo necesitas tu número de pedido y cédula de identidad.",
        ],
      },
      {
        heading: "Zonas extremas y localidades apartadas",
        body: [
          "Aysén, Magallanes, Isla de Pascua y Juan Fernández pueden tener plazos y tarifas especiales. Si tu comuna no aparece con opciones, escríbenos y cotizamos el envío contigo.",
        ],
      },
    ],
  },
  {
    slug: "devoluciones",
    title: "Cambios y devoluciones",
    summary: "Tus derechos como consumidor y cómo gestionamos cambios.",
    sections: [
      {
        heading: "Derecho a retracto (10 días)",
        body: [
          "En compras a distancia puedes retractarte dentro de los 10 días corridos desde la recepción del producto, siempre que esté sin uso, completo y en su embalaje original con todos sus accesorios.",
          "Para ejercerlo escríbenos indicando tu número de pedido. Coordinamos el retiro o la devolución y reembolsamos por el mismo medio de pago dentro de los 10 días hábiles siguientes a la recepción del producto en nuestra bodega.",
        ],
      },
      {
        heading: "Producto con falla",
        body: [
          "Si el producto llega fallado o presenta un defecto de fabricación dentro de los primeros 6 meses, la Ley del Consumidor te permite elegir entre cambio, reparación o devolución del dinero.",
          "Envíanos fotos o un video de la falla junto a tu número de pedido y activamos la garantía sin costo para ti.",
        ],
      },
      {
        heading: "Producto equivocado o dañado en el transporte",
        body: [
          "Revisa tu pedido al recibirlo. Si llegó dañado o no corresponde, avísanos dentro de las 48 horas siguientes a la entrega y nos hacemos cargo del retiro y del reemplazo.",
        ],
      },
    ],
  },
  {
    slug: "garantia",
    title: "Garantía oficial en Chile",
    summary: "Respaldo local, repuestos y servicio técnico sin enviar tu equipo al extranjero.",
    sections: [
      {
        heading: "Qué cubre",
        body: [
          "Todos los equipos STARSEEKER comprados en starseerker.cl tienen garantía por defectos de fabricación. El plazo de cada producto se indica en su ficha (12 meses salvo que se señale otro).",
          "La garantía cubre fallas de componentes, motor, electrónica y defectos de fábrica en condiciones normales de uso doméstico.",
        ],
      },
      {
        heading: "Qué no cubre",
        body: [
          "Daños por caídas, humedad, uso comercial intensivo no declarado, manipulación por terceros no autorizados, desgaste normal de piezas de consumo y uso de accesorios no originales.",
        ],
      },
      {
        heading: "Cómo activarla",
        body: [
          "Escríbenos con tu número de pedido y una descripción de la falla. Somos el distribuidor oficial, así que la gestión se resuelve en Chile: sin trámites de importación ni envíos al exterior.",
        ],
      },
    ],
  },
  {
    slug: "pagos",
    title: "Medios de pago",
    summary: "Todas las formas de pagar tu pedido de manera segura.",
    sections: [
      {
        heading: "Mercado Pago",
        body: [
          "Procesamos los pagos con Mercado Pago: tarjetas de crédito (con cuotas según tu banco), tarjetas de débito, Redcompra, saldo de Mercado Pago y transferencia bancaria.",
          "Nunca almacenamos los datos de tu tarjeta: el cobro se realiza íntegramente en la plataforma de Mercado Pago.",
        ],
      },
      {
        heading: "Boleta y factura",
        body: [
          "Todas las compras incluyen boleta electrónica. Si necesitas factura, indica tu RUT en el checkout y escríbenos con los datos de tu empresa (razón social, giro y dirección) el mismo día de la compra.",
        ],
      },
      {
        heading: "Pagos pendientes",
        body: [
          "Si pagas con transferencia o efectivo, la acreditación puede tardar algunas horas. El pedido queda en estado \"esperando pago\" y se libera automáticamente cuando Mercado Pago confirma la transacción.",
        ],
      },
    ],
  },
];

export const LEGAL_PAGES: ContentPage[] = [
  {
    slug: "terminos",
    title: "Términos y condiciones",
    summary: "Condiciones de uso y de compra en starseerker.cl.",
    sections: [
      {
        heading: "Sobre el sitio",
        body: [
          "starseerker.cl es operado por el distribuidor oficial de STARSEEKER en Chile. Al realizar una compra aceptas estos términos, que se rigen por la legislación chilena y en particular por la Ley 19.496 sobre protección de los derechos de los consumidores.",
        ],
      },
      {
        heading: "Precios y stock",
        body: [
          "Todos los precios se expresan en pesos chilenos con IVA incluido. El stock se actualiza automáticamente; si un producto se agota entre el pago y la preparación del pedido, te contactamos para ofrecerte el reemplazo o la devolución íntegra del dinero.",
          "Nos reservamos el derecho de corregir errores evidentes de precio, informándote antes de procesar el pedido.",
        ],
      },
      {
        heading: "Formación del contrato",
        body: [
          "La compra se perfecciona cuando Mercado Pago confirma el pago y nosotros confirmamos por correo la disponibilidad del producto. Antes de eso el pedido se considera una oferta de compra.",
        ],
      },
      {
        heading: "Despacho",
        body: [
          "Los plazos publicados son estimaciones en días hábiles y pueden variar por causas ajenas a nosotros (clima, contingencias del courier, direcciones incompletas). Es responsabilidad del comprador entregar una dirección correcta y completa.",
        ],
      },
    ],
  },
  {
    slug: "privacidad",
    title: "Política de privacidad",
    summary: "Cómo tratamos tus datos personales.",
    sections: [
      {
        heading: "Datos que recopilamos",
        body: [
          "Recopilamos los datos que ingresas al comprar o contactarnos: nombre, correo, teléfono, RUT (opcional, para documentos tributarios) y dirección de despacho. También registramos datos técnicos básicos de navegación.",
        ],
      },
      {
        heading: "Para qué los usamos",
        body: [
          "Usamos tus datos exclusivamente para procesar pedidos, emitir documentos, despachar productos, dar soporte y —si te suscribes— enviarte novedades. No vendemos ni cedemos tus datos a terceros con fines publicitarios.",
        ],
      },
      {
        heading: "Terceros que intervienen",
        body: [
          "Compartimos los datos estrictamente necesarios con Mercado Pago (procesamiento de pagos), con el courier que despacha tu pedido y con Resend (envío de correos transaccionales).",
        ],
      },
      {
        heading: "Tus derechos",
        body: [
          "Puedes solicitar acceso, rectificación, cancelación u oposición al tratamiento de tus datos escribiéndonos. Las suscripciones al newsletter incluyen siempre un enlace para darse de baja.",
        ],
      },
    ],
  },
];

export function findContent(pages: ContentPage[], slug: string): ContentPage | undefined {
  return pages.find((page) => page.slug === slug);
}
