import { cn } from "@repo/core";
import Image from "next/image";
import Link from "next/link";

type LogoVariant = "header" | "footer" | "icon";
type LogoTone = "light" | "dark";

type LogoProps = {
  variant?: LogoVariant;
  tone?: LogoTone;
  className?: string;
  priority?: boolean;
  href?: string;
};

const LOGO_SOURCES = {
  header: "/next-assets/logo-header.svg",
  footerLight: "/next-assets/logo-header.svg",
  footerDark: "/next-assets/logo-dark.svg",
  icon: "/next-assets/logo-icon.svg",
} as const;

function getLogoSrc(variant: LogoVariant, tone: LogoTone): string {
  if (variant === "footer") {
    return tone === "dark" ? LOGO_SOURCES.footerDark : LOGO_SOURCES.footerLight;
  }

  return LOGO_SOURCES[variant];
}

function getLogoSize(variant: LogoVariant) {
  if (variant === "icon") {
    return { width: 32, height: 32 };
  }

  if (variant === "footer") {
    return { width: 140, height: 32 };
  }

  return { width: 160, height: 36 };
}

export function Logo({
  variant = "header",
  tone = "light",
  className,
  priority = false,
  href = "/",
}: LogoProps) {
  const src = getLogoSrc(variant, tone);
  const { width, height } = getLogoSize(variant);

  return (
    <Link href={href} className="inline-flex items-center" aria-label="KobiAi">
      <Image
        src={src}
        alt="KobiAi"
        width={width}
        height={height}
        className={cn(
          "block h-auto max-w-full",
          variant === "header" && "w-[130px] sm:w-[145px] md:w-[160px]",
          variant === "footer" && "w-[120px] sm:w-[130px]",
          variant === "icon" && "h-8 w-8",
          className,
        )}
        priority={priority}
      />
    </Link>
  );
}
