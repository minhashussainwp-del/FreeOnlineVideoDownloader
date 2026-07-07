import type { ComponentType } from "react";
import {
  SiYoutube,
  SiTiktok,
  SiInstagram,
  SiFacebook,
  SiX,
  SiReddit,
  SiSnapchat,
  SiSoundcloud,
} from "react-icons/si";
import { Scissors, Clapperboard, Drama } from "lucide-react";

type IconProps = { className?: string };

const map: Record<string, ComponentType<IconProps>> = {
  youtube: SiYoutube,
  tiktok: SiTiktok,
  instagram: SiInstagram,
  facebook: SiFacebook,
  twitter: SiX,
  reddit: SiReddit,
  snapchat: SiSnapchat,
  soundcloud: SiSoundcloud,
  capcut: Scissors,
  snackvideo: Clapperboard,
  douyin: Drama,
};

export function PlatformIcon({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const Icon = map[slug] ?? Clapperboard;
  return <Icon className={className} />;
}
