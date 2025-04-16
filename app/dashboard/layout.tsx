import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

// 이 레이아웃은 동적으로 렌더링됩니다 (SSR)
export const dynamic = "force-dynamic";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      redirect("/login");
    }

    return <DashboardLayout>{children}</DashboardLayout>;
  } catch (error) {
    console.error("Error in dashboard layout:", error);
    redirect("/login");
  }
}
