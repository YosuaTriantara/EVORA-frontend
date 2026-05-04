"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Share2, Bookmark, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  onBackClick?: () => void;
  rightActions?: React.ReactNode;
  className?: string;
  /** Show hamburger menu button (for dashboard sidebar) */
  showMenuToggle?: boolean;
  /** Custom menu toggle element (e.g., SheetTrigger from sidebar) */
  menuToggle?: React.ReactNode;
  /** Callback when menu button clicked (if no custom menuToggle provided) */
  onMenuClick?: () => void;
}

export function MobileHeader({
  title,
  showBack = true,
  backHref,
  onBackClick,
  rightActions,
  className,
  showMenuToggle = false,
  menuToggle,
  onMenuClick,
}: MobileHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full bg-background/95 backdrop-blur-sm border-b",
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: Menu toggle + Back + Title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Menu Toggle - only on mobile, hidden on lg */}
          {showMenuToggle && (
            <div className="lg:hidden flex-shrink-0">
              {menuToggle || (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onMenuClick}
                  className="h-10 w-10 -ml-2"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              )}
            </div>
          )}
          
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors flex-shrink-0"
              aria-label="Kembali"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
          )}
          
          {title && (
            <h1 className="font-semibold text-slate-900 truncate text-base">
              {title}
            </h1>
          )}
        </div>

        {/* Right: Actions */}
        {rightActions && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {rightActions}
          </div>
        )}
      </div>
    </header>
  );
}

export function ShareButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors"
      aria-label="Bagikan"
    >
      <Share2 className="w-5 h-5 text-slate-600" />
    </button>
  );
}

export function BookmarkButton({
  isBookmarked,
  onClick,
}: {
  isBookmarked?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors"
      aria-label={isBookmarked ? "Hapus bookmark" : "Bookmark"}
    >
      <Bookmark
        className={cn(
          "w-5 h-5 transition-colors",
          isBookmarked ? "fill-red-600 text-red-600" : "text-slate-600"
        )}
      />
    </button>
  );
}
