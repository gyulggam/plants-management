"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>로딩 중...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">대시보드</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 발전소</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24개</div>
            <p className="text-xs text-muted-foreground">
              전국에 위치한 발전소 총 개수
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">현재 발전량</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">256.4 MW</div>
            <p className="text-xs text-muted-foreground">
              전체 발전소 총 발전량
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">발전 효율</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85.2%</div>
            <p className="text-xs text-muted-foreground">
              이번 달 평균 발전 효율
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>대시보드 안내</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            왼쪽 사이드바의 메뉴를 통해 발전소 관리 시스템의 다양한 기능을
            이용하실 수 있습니다.
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600">
            <li>발전소 목록에서 전체 발전소를 확인하실 수 있습니다.</li>
            <li>
              발전소를 선택하여 상세 정보를 확인하고 관리하실 수 있습니다.
            </li>
            <li>모니터링 탭에서 실시간 발전 현황을 확인하실 수 있습니다.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
