import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function PlantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/login");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
