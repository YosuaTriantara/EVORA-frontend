"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const anchor = (href: string) => {
    if (href.startsWith("/")) return href;
    return isHome ? href : `/${href}`;
  };

  const navLinks = [
    { href: anchor("#features"), label: "Fitur" },
    { href: anchor("/events"), label: "Cari Event" },
    { href: "/voting", label: "Voting", badge: "Live" },
    { href: anchor("#about"), label: "Tentang Kami" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="container mx-auto h-14 px-5 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/evora-logo-2026.png"
            alt="Evora Logo"
            className="w-10 h-10 object-contain drop-shadow-md"
            style={{ marginRight: 4 }}
          />
          <span className="text-xl font-bold tracking-tight text-slate-900">
            EVORA
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex gap-1">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              className="text-slate-600 hover:text-red-900 hover:bg-red-50"
              asChild
            >
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>

        {/* AUTH BUTTONS & MOBILE TOGGLE */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex gap-2">
            <Button
              variant="ghost"
              className="font-medium text-slate-600"
              asChild
            >
              <Link href="/login">Masuk</Link>
            </Button>
          </div>

          {/* MOBILE MENU TRIGGER */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-slate-900"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="bg-white w-75 sm:w-100">
              <SheetHeader className="border-b pb-4 mb-4">
                <SheetTitle className="flex items-center gap-2">
                  <img
                    src="/evora-logo-2026.png"
                    alt="Evora Logo"
                    className="w-8 h-8 object-contain drop-shadow-md"
                  />
                  <span className="text-slate-900">EVORA MENU</span>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between text-base font-medium text-slate-700 hover:text-red-900 hover:bg-red-50 px-4 py-3 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="my-4 border-t border-slate-100" />

                <Button
                  variant="outline"
                  className="w-full h-12 border-slate-300 text-slate-700"
                  asChild
                >
                  <Link href="/login">Masuk</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
