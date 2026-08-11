import { HomeBlocks } from "@/components/home/home-blocks";
import { getHomeBlocks } from "@/lib/home";

export const revalidate = 120;

export default async function HomePage() {
  const blocks = await getHomeBlocks();
  return <HomeBlocks blocks={blocks} />;
}
