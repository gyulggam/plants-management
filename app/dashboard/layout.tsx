import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

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
