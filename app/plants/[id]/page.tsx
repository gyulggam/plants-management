"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { PowerPlant } from "@/types/power-plant";
import { getPlantById, deletePlant } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MapPin, Trash, Edit, ArrowLeft } from "lucide-react";
import { formatNumber } from "@/lib/utils";
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
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 서버 컴포넌트가 아닌 클라이언트에서만 로드할 맵 컴포넌트 (SSR 비활성화)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

// 발전소 타입별 마커 아이콘 설정
const getPlantIcon = (type: string) => {
  // 발전소 타입별 다른 색상 적용
  const color =
    type === "태양광" ? "#FF5733" : type === "풍력" ? "#33B5FF" : "#7D33FF";

  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
    className: "custom-marker",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

export default function PlantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [plant, setPlant] = useState<PowerPlant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchPlantData() {
      try {
        const plantId = Number(params.id);
        if (isNaN(plantId)) {
          setError("유효하지 않은 발전소 ID입니다.");
          setLoading(false);
          return;
        }

        const data = await getPlantById(plantId);
        setPlant(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching plant details:", err);
        setError("발전소 정보를 불러오는 중 오류가 발생했습니다.");
        setLoading(false);
      }
    }

    fetchPlantData();
  }, [params.id]);

  const handleDelete = async () => {
    if (!plant) return;

    setIsDeleting(true);
    try {
      await deletePlant(plant.id);
      router.push("/plants");
    } catch (err) {
      console.error("Error deleting plant:", err);
      setError("발전소 삭제 중 오류가 발생했습니다.");
      setIsDeleting(false);
    }
  };

  // 로딩 중 상태 표시
  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>발전소 상세 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-8">
              <p>정보를 불러오는 중입니다...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 오류 상태 표시
  if (error) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>발전소 상세 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-8 text-red-500">
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 발전소가 없는 경우
  if (!plant) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>발전소 상세 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-8">
              <p>발전소 정보를 찾을 수 없습니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 상태에 따른 배지 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case "정상":
      case "가동중":
        return "bg-green-100 text-green-800";
      case "점검중":
        return "bg-yellow-100 text-yellow-800";
      case "고장":
      case "중지":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/plants`)}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Button>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/plants/${plant.id}/edit`)}
            className="gap-1"
          >
            <Edit className="h-4 w-4" />
            수정
          </Button>

          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-1">
                <Trash className="h-4 w-4" />
                삭제
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>발전소 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  정말로 [{plant.infra.name}] 발전소를 삭제하시겠습니까?
                  <br />이 작업은 취소할 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {isDeleting ? "삭제 중..." : "삭제"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{plant.infra.name}</CardTitle>
              <CardDescription className="mt-1.5 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {plant.infra.address}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(plant.status || "정상")}>
              {plant.status || "정상"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">기본 정보</TabsTrigger>
              <TabsTrigger value="technical">기술 정보</TabsTrigger>
              <TabsTrigger value="contract">계약 정보</TabsTrigger>
            </TabsList>

            {/* 기본 정보 탭 */}
            <TabsContent value="info" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    발전소 유형
                  </h3>
                  <p>{plant.infra.type}</p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    설비 용량
                  </h3>
                  <p>{formatNumber(plant.infra.capacity)} kW</p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    설치 일자
                  </h3>
                  <p>{plant.infra.install_date || "정보 없음"}</p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    최종 수정일
                  </h3>
                  <p>{new Date(plant.modified_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  발전소 위치
                </h3>
                <div className="h-[300px] w-full rounded-md overflow-hidden relative z-10">
                  {plant && typeof window !== "undefined" && (
                    <MapContainer
                      center={[plant.infra.latitude, plant.infra.longitude]}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                      className="z-0"
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker
                        position={[plant.infra.latitude, plant.infra.longitude]}
                        icon={getPlantIcon(plant.infra.type)}
                      >
                        <Popup>
                          <div className="text-sm">
                            <h3 className="font-bold">{plant.infra.name}</h3>
                            <p>유형: {plant.infra.type}</p>
                            <p>용량: {formatNumber(plant.infra.capacity)} kW</p>
                            <p>주소: {plant.infra.address}</p>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  위도: {formatNumber(plant.infra.latitude, 6)}, 경도:{" "}
                  {formatNumber(plant.infra.longitude, 6)}
                </p>
              </div>
            </TabsContent>

            {/* 기술 정보 탭 */}
            <TabsContent value="technical" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    인버터 용량
                  </h3>
                  <p>
                    {formatNumber(
                      plant.infra.inverter[0]?.capacity || plant.infra.capacity
                    )}{" "}
                    kW
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    경사 각도
                  </h3>
                  <p>
                    {plant.infra.inverter[0]?.tilt
                      ? `${formatNumber(plant.infra.inverter[0].tilt, 1)}°`
                      : "정보 없음"}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    방위각
                  </h3>
                  <p>
                    {plant.infra.inverter[0]?.azimuth
                      ? `${formatNumber(plant.infra.inverter[0].azimuth, 1)}°`
                      : "정보 없음"}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    모듈 유형
                  </h3>
                  <p>{plant.infra.inverter[0]?.module_type || "정보 없음"}</p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    설치 유형
                  </h3>
                  <p>{plant.infra.inverter[0]?.install_type || "정보 없음"}</p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    KPX 식별자
                  </h3>
                  <p>
                    {plant.infra.kpx_identifier?.kpx_cbp_gen_id || "정보 없음"}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    RTU ID
                  </h3>
                  <p>{plant.monitoring?.rtu_id || "정보 없음"}</p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    고도
                  </h3>
                  <p>
                    {plant.infra.altitude
                      ? `${formatNumber(plant.infra.altitude)} m`
                      : "정보 없음"}
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* 계약 정보 탭 */}
            <TabsContent value="contract" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    계약 유형
                  </h3>
                  <p>{plant.contract?.contract_type || "정보 없음"}</p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    계약 기간
                  </h3>
                  <p>{plant.contract?.contract_date || "정보 없음"}</p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    가중치
                  </h3>
                  <p>
                    {plant.contract?.weight
                      ? formatNumber(plant.contract.weight, 2)
                      : "정보 없음"}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    고정 계약 유형
                  </h3>
                  <p>{plant.contract?.fixed_contract_type || "정보 없음"}</p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    고정 계약 가격
                  </h3>
                  <p>
                    {plant.contract?.fixed_contract_price
                      ? formatNumber(plant.contract.fixed_contract_price, 2)
                      : "정보 없음"}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    고정 계약 체결일
                  </h3>
                  <p>
                    {plant.contract?.fixed_contract_agreement_date
                      ? new Date(
                          plant.contract.fixed_contract_agreement_date
                        ).toLocaleDateString()
                      : "정보 없음"}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    보장 용량
                  </h3>
                  <p>
                    {plant.guaranteed_capacity
                      ? formatNumber(plant.guaranteed_capacity)
                      : "정보 없음"}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
