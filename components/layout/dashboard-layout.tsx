"use client";

import { CustomSidebar } from "../ui/sidebar";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { DevPanel } from "../dev/dev-panel";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(
    process.env.NODE_ENV === "development"
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const navigationItems = [
    {
      title: "대시보드",
      href: "/dashboard",
      isActive: pathname === "/dashboard",
    },
    {
      title: "발전소 관리",
      items: [
        {
          title: "리스트 뷰",
          href: "/plants",
          isActive: pathname === "/plants",
        },
        {
          title: "지도 뷰",
          href: "/plants/map",
          isActive: pathname === "/plants/map",
        },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">메뉴 열기</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <CustomSidebar items={navigationItems} />
            </SheetContent>
          </Sheet>
          <Link href="/dashboard" className="font-semibold">
            발전소 관리 시스템
          </Link>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/dashboard" className="font-semibold">
            발전소 관리 시스템
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {process.env.NODE_ENV === "development" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDevPanel(!showDevPanel)}
              className="text-xs"
            >
              {showDevPanel ? "개발 패널 숨기기" : "개발 패널 표시"}
            </Button>
          )}
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user.image || undefined}
                      alt={session.user.name || "사용자"}
                    />
                    <AvatarFallback>
                      {session.user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="outline">로그인</Button>
            </Link>
          )}
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r md:block">
          <CustomSidebar items={navigationItems} />
        </aside>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>

      {/* 개발 패널 */}
      {showDevPanel && process.env.NODE_ENV === "development" && <DevPanel />}
    </div>
  );
}
