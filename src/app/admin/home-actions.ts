"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import {
  emptyBlock,
  getHomeBlocks,
  saveHomeBlocks,
  type BlockType,
  type HomeBlock,
} from "@/lib/home";

const TYPES: BlockType[] = ["hero", "products", "categories", "gallery", "mediaText", "banner"];

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

function bool(form: FormData, key: string): boolean {
  const value = form.get(key);
  return value === "on" || value === "true" || value === "1";
}

function int(form: FormData, key: string, fallback: number): number {
  const value = Number(String(form.get(key) ?? "").replace(/[^\d]/g, ""));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function lines(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function refresh() {
  revalidatePath("/admin/portada");
  revalidatePath("/");
}

export async function addHomeBlock(formData: FormData) {
  await requireSession();
  const type = str(formData, "type") as BlockType;
  if (!TYPES.includes(type)) return;

  const blocks = await getHomeBlocks();
  await saveHomeBlocks([...blocks, emptyBlock(type)]);
  refresh();
}

export async function removeHomeBlock(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  const blocks = await getHomeBlocks();
  await saveHomeBlocks(blocks.filter((block) => block.id !== id));
  refresh();
}

export async function moveHomeBlock(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  const direction = str(formData, "direction") === "up" ? -1 : 1;

  const blocks = await getHomeBlocks();
  const index = blocks.findIndex((block) => block.id === id);
  const target = index + direction;
  if (index === -1 || target < 0 || target >= blocks.length) return;

  const next = [...blocks];
  [next[index], next[target]] = [next[target], next[index]];
  await saveHomeBlocks(next);
  refresh();
}

export async function toggleHomeBlock(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  const blocks = await getHomeBlocks();
  await saveHomeBlocks(
    blocks.map((block) => (block.id === id ? { ...block, active: !block.active } : block)),
  );
  refresh();
}

/** Guarda los campos del bloque según su tipo. */
export async function saveHomeBlock(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  const blocks = await getHomeBlocks();

  const next: HomeBlock[] = blocks.map((block) => {
    if (block.id !== id) return block;

    switch (block.type) {
      case "hero":
        return {
          ...block,
          mediaUrl: str(formData, "mediaUrl"),
          posterUrl: str(formData, "posterUrl"),
          overlayText: str(formData, "overlayText"),
          bandText: str(formData, "bandText"),
          ctaLabel: str(formData, "ctaLabel"),
          ctaHref: str(formData, "ctaHref"),
        };
      case "products":
        return {
          ...block,
          title: str(formData, "title"),
          filter: str(formData, "filter"),
          categorySlug: str(formData, "categorySlug"),
          limit: int(formData, "limit", 4),
          layout: str(formData, "layout") === "carousel" ? "carousel" : "grid",
          linkLabel: str(formData, "linkLabel"),
          linkHref: str(formData, "linkHref"),
        };
      case "categories":
        return {
          ...block,
          title: str(formData, "title"),
          linkLabel: str(formData, "linkLabel"),
          linkHref: str(formData, "linkHref"),
        };
      case "gallery":
        return {
          ...block,
          title: str(formData, "title"),
          items: lines(str(formData, "items")),
          layout: str(formData, "layout") === "carousel" ? "carousel" : "grid",
        };
      case "mediaText":
        return {
          ...block,
          mediaUrl: str(formData, "mediaUrl"),
          eyebrow: str(formData, "eyebrow"),
          title: str(formData, "title"),
          body: str(formData, "body"),
          ctaLabel: str(formData, "ctaLabel"),
          ctaHref: str(formData, "ctaHref"),
          reversed: bool(formData, "reversed"),
        };
      case "banner":
        return {
          ...block,
          title: str(formData, "title"),
          body: str(formData, "body"),
          ctaLabel: str(formData, "ctaLabel"),
          ctaHref: str(formData, "ctaHref"),
        };
      default:
        return block;
    }
  });

  await saveHomeBlocks(next);
  refresh();
}
