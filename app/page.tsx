import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

// 이 페이지는 동적으로 렌더링됩니다 (SSR)
export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    // 인증 확인 시도
    const authenticated = await isAuthenticated();

    // 인증 결과에 따라 리다이렉션
    if (authenticated) {
      redirect("/dashboard");
    } else {
      redirect("/login");
    }
  } catch (error) {
    // 오류 발생 시 로그인 페이지로 리다이렉션
    console.error("Error in root page:", error);
    redirect("/login");
  }

  // 이 코드는 실행되지 않지만 Next.js가 기대하는 반환값을 위해 추가
  return null;
}
