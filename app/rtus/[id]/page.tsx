"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getRTU, deleteRTU } from "@/lib/api";
import { RTU } from "@/types/rtu";
import { formatDate } from "@/lib/utils";
import { Loader2, PencilIcon, TrashIcon, ArrowLeftIcon } from "lucide-react";

export default function RTUDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [rtu, setRTU] = useState<RTU | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchRTU();
  }, [params.id]);

  const fetchRTU = async () => {
    setLoading(true);
    setError(null);
    try {
      const id = params.id as string;
      const data = await getRTU(id);
      setRTU(data);
    } catch (err) {
      setError("RTU 정보를 불러오는 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!rtu) return;

    setIsDeleting(true);
    try {
      await deleteRTU(rtu.id);
      router.push("/rtus");
    } catch (err) {
      console.error("RTU 삭제 실패:", err);
      setError("RTU를 삭제하는 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  // RTU 상태에 따른 배지 스타일
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">활성</Badge>;
      case "inactive":
        return <Badge variant="outline">비활성</Badge>;
      case "maintenance":
        return <Badge className="bg-amber-500">유지보수</Badge>;
      case "error":
        return <Badge variant="destructive">오류</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">RTU 정보를 불러오는 중...</span>
      </div>
    );
  }

  if (error || !rtu) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="text-xl font-medium text-destructive">
          {error || "RTU 정보를 찾을 수 없습니다."}
        </div>
        <Button onClick={() => router.push("/rtus")}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> RTU 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/rtus")}
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{rtu.name}</h1>
            <p className="text-muted-foreground">
              {rtu.manufacturer} {rtu.model}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/rtus/${rtu.id}/edit`)}
          >
            <PencilIcon className="mr-2 h-4 w-4" /> 편집
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <TrashIcon className="mr-2 h-4 w-4" /> 삭제
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>RTU 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  정말로 이 RTU를 삭제하시겠습니까? 이 작업은 되돌릴 수
                  없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "삭제 중..." : "삭제"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">기본 정보</TabsTrigger>
          <TabsTrigger value="connection">연결 정보</TabsTrigger>
          <TabsTrigger value="specifications">상세 사양</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>RTU 기본 정보 및 상태</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      RTU ID
                    </h3>
                    <p className="text-lg font-medium">{rtu.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      명칭
                    </h3>
                    <p className="text-lg font-medium">{rtu.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      유형
                    </h3>
                    <p>{rtu.type}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      상태
                    </h3>
                    <div className="mt-1">{getStatusBadge(rtu.status)}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      모델
                    </h3>
                    <p>{rtu.model}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      제조사
                    </h3>
                    <p>{rtu.manufacturer}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      설치 일자
                    </h3>
                    <p>{formatDate(rtu.installation_date)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      마지막 유지보수
                    </h3>
                    <p>
                      {rtu.last_maintenance_date
                        ? formatDate(rtu.last_maintenance_date)
                        : "기록 없음"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  위치 정보
                </h3>
                <p className="text-base">{rtu.location || "위치 정보 없음"}</p>
              </div>

              {rtu.description && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      설명
                    </h3>
                    <p className="text-base">{rtu.description}</p>
                  </div>
                </>
              )}

              {rtu.notes && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      비고
                    </h3>
                    <p className="text-base whitespace-pre-line">{rtu.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connection" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>연결 정보</CardTitle>
              <CardDescription>통신 및 발전소 연결 정보</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      통신 프로토콜
                    </h3>
                    <p>{rtu.communication_protocol}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      IP 주소
                    </h3>
                    <p>{rtu.ip_address || "설정되지 않음"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      포트
                    </h3>
                    <p>{rtu.port || "설정되지 않음"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      데이터 수집 주기
                    </h3>
                    <p>{rtu.data_interval}초</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      연결된 발전소
                    </h3>
                    <p>
                      {rtu.plant_id ? (
                        <Button
                          variant="link"
                          className="p-0 h-auto"
                          onClick={() => router.push(`/plants/${rtu.plant_id}`)}
                        >
                          {rtu.plant_name || `발전소 ID: ${rtu.plant_id}`}
                        </Button>
                      ) : (
                        "연결된 발전소 없음"
                      )}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      마지막 연결 시간
                    </h3>
                    <p>
                      {rtu.last_connection
                        ? formatDate(rtu.last_connection, "yyyy-MM-dd HH:mm:ss")
                        : "연결 기록 없음"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      배터리 잔량
                    </h3>
                    <p>
                      {rtu.battery_level !== null
                        ? `${rtu.battery_level}%`
                        : "정보 없음"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      신호 강도
                    </h3>
                    <p>
                      {rtu.signal_strength !== null
                        ? `${rtu.signal_strength} dBm`
                        : "정보 없음"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specifications" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>상세 사양</CardTitle>
              <CardDescription>
                RTU의 하드웨어 및 소프트웨어 사양
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      시리얼 번호
                    </h3>
                    <p>{rtu.serial_number}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      펌웨어 버전
                    </h3>
                    <p>{rtu.firmware_version}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4 pb-0">
              <p className="text-sm text-muted-foreground">
                설치일로부터 {getDaysSinceInstallation(rtu.installation_date)}일
                경과
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// 설치일로부터 경과일 계산
function getDaysSinceInstallation(installationDate: string): number {
  const installDate = new Date(installationDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - installDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export const dynamic = "force-dynamic";
