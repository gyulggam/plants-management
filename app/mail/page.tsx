"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { PenSquare, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MailPage() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">메일 서비스</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 발송내역 카드 */}
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/mail/history")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">발송내역</CardTitle>
              <Clock className="h-6 w-6 text-blue-500" />
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                지금까지 보낸 모든 메일 내역을 확인하고 관리할 수 있습니다.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push("/mail/history");
                }}
              >
                발송내역 보기
              </Button>
            </CardContent>
          </Card>

          {/* 메일 발송하기 카드 */}
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push("/mail/compose")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">메일 발송하기</CardTitle>
              <PenSquare className="h-6 w-6 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                새로운 메일을 작성하고 다수의 수신자에게 전송할 수 있습니다.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push("/mail/compose");
                }}
              >
                새 메일 작성
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
