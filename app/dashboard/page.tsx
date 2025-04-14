"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface History {
  id: string;
  plantId: string;
  type: string;
  changes: {
    before: {
      id?: string;
      name?: string;
      type?: string;
      capacity?: number;
      address?: string;
      latitude?: number;
      longitude?: number;
      status?: string;
    } | null;
    after: {
      id?: string;
      name?: string;
      type?: string;
      capacity?: number;
      address?: string;
      latitude?: number;
      longitude?: number;
      status?: string;
    } | null;
  };
  changedBy: string;
  changedAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [histories, setHistories] = useState<History[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchHistories = async () => {
      try {
        const response = await fetch("/api/plants/history");
        if (!response.ok) throw new Error("데이터를 가져오는데 실패했습니다.");
        const data = await response.json();
        setHistories(data);
      } catch (error) {
        console.error("변경 이력 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistories();
  }, []);

  if (status === "loading" || loading) {
    return <div>로딩 중...</div>;
  }

  if (!session) {
    return null;
  }

  const getChangeTypeLabel = (type: string) => {
    switch (type) {
      case "create":
        return "등록";
      case "update":
        return "수정";
      case "delete":
        return "삭제";
      default:
        return type;
    }
  };

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
          <CardTitle>최근 변경 이력</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>변경 유형</TableHead>
                  <TableHead>발전소</TableHead>
                  <TableHead>변경 내용</TableHead>
                  <TableHead>변경자</TableHead>
                  <TableHead>변경 일시</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {histories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      변경 이력이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  histories.slice(0, 5).map((history) => (
                    <TableRow
                      key={history.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/plants/${history.plantId}`)}
                    >
                      <TableCell>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            history.type === "create"
                              ? "bg-green-100 text-green-800"
                              : history.type === "update"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {getChangeTypeLabel(history.type)}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {history.changes.after?.name ||
                          history.changes.before?.name}
                      </TableCell>
                      <TableCell>
                        {history.type === "create"
                          ? "새로운 발전소가 등록되었습니다."
                          : history.type === "update"
                          ? "발전소 정보가 수정되었습니다."
                          : "발전소가 삭제되었습니다."}
                      </TableCell>
                      <TableCell>{history.changedBy}</TableCell>
                      <TableCell>
                        {format(
                          new Date(history.changedAt),
                          "yyyy-MM-dd HH:mm",
                          {
                            locale: ko,
                          }
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {histories.length > 5 && (
            <div className="mt-4 text-right">
              <button
                onClick={() => router.push("/plants/history")}
                className="text-sm text-primary hover:underline"
              >
                전체 변경 이력 보기 →
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
