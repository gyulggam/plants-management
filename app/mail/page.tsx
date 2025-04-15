import { MailList } from "@/components/ui/mail/mail-list";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function MailPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">메일 서비스</h1>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <MailList />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
