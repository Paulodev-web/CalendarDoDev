import Image from "next/image";
import Link from "next/link";
import { getBrandName } from "@/lib/config";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  href?: string;
  showText?: boolean;
  priority?: boolean;
  className?: string;
}

export function BrandLogo({
  href,
  showText = true,
  priority = false,
  className,
}: BrandLogoProps) {
  const brand = getBrandName();

  const content = (
    <>
      <Image
        src="/logo.png"
        alt={brand}
        width={140}
        height={36}
        priority={priority}
        className="h-8 w-auto object-contain md:h-9"
      />
      {showText && (
        <span className="font-mono text-sm font-bold text-neon-green">
          {brand.toLowerCase()}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn("flex items-center gap-2.5", className)}>
        {content}
      </Link>
    );
  }

  return <div className={cn("flex items-center gap-2.5", className)}>{content}</div>;
}
