"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}: PaginationProps) {
  // 총 페이지가 0이면 렌더링하지 않음
  if (totalPages <= 0) return null;

  // 페이지 범위 계산
  const generatePages = () => {
    const pages: (number | "ellipsis")[] = [];

    // 항상 1, 2, 3 페이지 표시
    for (let i = 1; i <= Math.min(3, totalPages); i++) {
      pages.push(i);
    }

    // 3페이지를 초과하는 경우의 논리
    if (totalPages > 3) {
      // 현재 페이지가 앞쪽 블록에 있지 않은 경우
      if (currentPage > 3 + siblingCount) {
        pages.push("ellipsis");
      }

      // 현재 페이지 주변 페이지 계산
      const startPage = Math.max(4, currentPage - siblingCount);
      const endPage = Math.min(totalPages - 1, currentPage + siblingCount);

      // 중간 페이지들 추가 (현재 페이지 주변)
      for (let i = startPage; i <= endPage; i++) {
        if (i > 3 && i < totalPages) {
          pages.push(i);
        }
      }

      // 마지막 페이지와 끝 페이지 사이에 간격이 있으면 ellipsis 추가
      if (endPage < totalPages - 1) {
        pages.push("ellipsis");
      }

      // 마지막 페이지가 이미 추가되지 않았다면 추가
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pages = generatePages();

  return (
    <div
      className={cn("flex items-center justify-center space-x-2", className)}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">이전 페이지</span>
      </Button>

      {pages.map((page, i) =>
        page === "ellipsis" ? (
          <Button
            key={`ellipsis-${i}`}
            variant="ghost"
            size="icon"
            disabled
            className="cursor-default"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">더 많은 페이지</span>
          </Button>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(page)}
            disabled={currentPage === page}
          >
            {page}
            <span className="sr-only">{page} 페이지로 이동</span>
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">다음 페이지</span>
      </Button>
    </div>
  );
}
