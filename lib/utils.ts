import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 숫자를 천 단위 구분 기호(,)가 포함된 형식으로 변환합니다.
 * @param value 변환할 숫자
 * @param decimals 소수점 이하 자릿수 (기본값: 0)
 * @returns 포맷이 적용된 문자열
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString("ko-KR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatDate(
  date: string,
  formatStr: string = "yyyy-MM-dd"
): string {
  try {
    return format(new Date(date), formatStr, { locale: ko });
  } catch (error) {
    console.error("Date formatting error:", error);
    return date;
  }
}
