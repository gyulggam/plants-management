import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

// 이 레이아웃은 동적으로 렌더링됩니다 (SSR)
export const dynamic = "force-dynamic";

export default async function PlantsLayout({
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
    console.error("Error in plants layout:", error);
    redirect("/login");
  }
}
