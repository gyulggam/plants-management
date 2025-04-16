"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface SidebarItemProps {
  title: string;
  href?: string;
  isActive?: boolean;
  items?: {
    title: string;
    href: string;
    isActive: boolean;
  }[];
}

interface SidebarProps {
  items: SidebarItemProps[];
}

export function CustomSidebar({ items }: SidebarProps) {
  return (
    <div className="flex h-full flex-col bg-background p-4">
      <nav className="flex-1 space-y-1">
        {items.map((item, index) => (
          <SidebarItem key={index} {...item} />
        ))}
      </nav>
    </div>
  );
}

function SidebarItem({ title, href, isActive, items }: SidebarItemProps) {
  const [expanded, setExpanded] = useState(true);

  // 서브메뉴가 있는 경우
  if (items?.length) {
    // 서브메뉴 중 활성화된 항목이 있는지 확인
    const hasActiveSubItem = items.some((item) => item.isActive);

    return (
      <div className="space-y-1">
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground",
            expanded && "bg-accent/50",
            hasActiveSubItem &&
              "bg-accent/70 text-accent-foreground font-semibold"
          )}
        >
          <span>{title}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              expanded && "rotate-180"
            )}
          />
        </button>
        {expanded && (
          <div className="ml-4 space-y-1">
            {items.map((subItem, index) => (
              <Link
                key={index}
                href={subItem.href}
                className={cn(
                  "flex w-full rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  subItem.isActive &&
                    "bg-primary text-primary-foreground font-semibold border-l-4 border-primary shadow-sm"
                )}
              >
                {subItem.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 단일 메뉴 항목인 경우
  return (
    <Link
      href={href || "#"}
      className={cn(
        "flex w-full rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground",
        isActive &&
          "bg-primary text-primary-foreground font-semibold border-l-4 border-primary shadow-sm"
      )}
    >
      {title}
    </Link>
  );
}
