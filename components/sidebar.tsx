"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCircle,
  FileSpreadsheet,
  Calculator,
  FileText,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dosen", label: "Data Dosen", icon: UserCircle },
  { href: "/import", label: "Import Excel", icon: FileSpreadsheet },
  { href: "/penilaian", label: "Penilaian AK", icon: Calculator },
  { href: "/dokumen", label: "Buat Dokumen", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  const NavLinks = (
    <>
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white font-bold shadow-md">
          PAK
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm leading-tight">
            PAK Konversi
          </span>
          <span className="text-xs text-muted-foreground">
            Pembuat Dokumen Dosen
          </span>
        </div>
      </div>
      <Separator />
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Menu Utama
        </p>
        {navItems.slice(0, 3).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-2">
          Penilaian & Dokumen
        </p>
        {navItems.slice(3).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <Separator />
      <div className="p-4 text-center text-xs text-muted-foreground">
        PAK Konversi Dosen v1.0
        <br />
        <span className="text-[10px]">PermenPANRB No. 1 / 2023</span>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile */}
      <Sheet>
        <SheetTrigger
          render={
            <button
              type="button"
              className="lg:hidden fixed top-4 left-4 z-50 inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          }
        />
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          {NavLinks}
        </SheetContent>
      </Sheet>

      {/* Desktop */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-72 border-r bg-card z-40">
        {NavLinks}
      </aside>
    </>
  );
}
