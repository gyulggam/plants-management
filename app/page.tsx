import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default async function HomePage() {
  const authenticated = await isAuthenticated();

  if (authenticated) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }

  // 이 코드는 실행되지 않지만 Next.js가 기대하는 반환값을 위해 추가
  return null;
}
