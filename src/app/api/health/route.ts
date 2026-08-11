import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Healthcheck para Coolify / Docker.
 *
 * Comprueba que el proceso responde y que la base de datos está alcanzable.
 * Devuelve 503 si la base falla, para que Coolify no envíe tráfico a un
 * contenedor que no puede atender pedidos.
 */
export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      database: "up",
      latencyMs: Date.now() - startedAt,
      uptimeSeconds: Math.round(process.uptime()),
    });
  } catch (error) {
    console.error("[health] Base de datos inalcanzable:", error);
    return NextResponse.json(
      { status: "degraded", database: "down" },
      { status: 503 },
    );
  }
}
