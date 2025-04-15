import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function RtuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  // 로그인 안되어 있으면 로그인 화면으로
  if (!session?.user) {
    redirect("/login");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
