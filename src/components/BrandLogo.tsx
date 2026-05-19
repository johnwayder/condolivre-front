import Image from "next/image";
import logo from "@/assets/images/condolivre-logo.png";

const LOGO_RATIO = 300 / 40;

export default function BrandLogo({
  height = 24,
  className,
}: {
  height?: number;
  className?: string;
}) {
  return (
    <Image
      src={logo}
      alt="CondoLivre"
      height={height}
      width={Math.round(height * LOGO_RATIO)}
      className={className}
      priority
    />
  );
}
