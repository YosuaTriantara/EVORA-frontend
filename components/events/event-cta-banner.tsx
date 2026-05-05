import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface EventCtaBannerProps {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function EventCtaBanner({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: EventCtaBannerProps) {
  return (
    <div className="bg-red-900 rounded-2xl p-7 space-y-4">
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-sm text-white/70 leading-relaxed">{description}</p>
      </div>
      <div className="flex gap-3 flex-wrap">
        <Link
          href={primaryHref}
          className="inline-flex items-center gap-2 bg-white text-red-900 text-sm font-bold px-5 py-2.5 rounded-full hover:bg-red-50 transition-colors"
        >
          {primaryLabel}
          <ArrowUpRight className="w-4 h-4" />
        </Link>
        {secondaryLabel && secondaryHref && (
          <Link
            href={secondaryHref}
            className="inline-flex items-center gap-2 text-white text-sm font-bold px-5 py-2.5 rounded-full border border-white/40 hover:bg-white/10 transition-colors"
          >
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  );
}