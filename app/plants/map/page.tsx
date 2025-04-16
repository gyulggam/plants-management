"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { PowerPlant } from "@/types/power-plant";
import { getAllPlants } from "@/lib/api";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { formatNumber } from "@/lib/utils";
import { FilterPanel } from "@/components/plants/filter-panel";

// Leaflet 마커 아이콘 설정
const customIcon = (type: string) => {
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

export default function MapPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL에서 파라미터 가져오기
  const searchTerm = searchParams.get("search") || "";
  const typeFilter = searchParams.get("type") || "";
  const statusFilter = searchParams.get("status") || "";
  const regionFilter = searchParams.get("region") || "";
  const minCapacityParam = searchParams.get("minCapacity");
  const maxCapacityParam = searchParams.get("maxCapacity");

  const [plants, setPlants] = useState<PowerPlant[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<PowerPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 필터 상태
  const [nameFilter, setNameFilter] = useState(searchTerm);
  const [type, setType] = useState(typeFilter || "전체");
  const [status, setStatus] = useState(statusFilter || "전체");
  const [region, setRegion] = useState(regionFilter || "전체");
  const [minCapacity, setMinCapacity] = useState(
    minCapacityParam ? parseInt(minCapacityParam) : 0
  );
  const [maxCapacity, setMaxCapacity] = useState(
    maxCapacityParam ? parseInt(maxCapacityParam) : 100000
  );
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  // 고유한 지역 및 발전소 유형 목록 (데이터에서 추출)
  const [regions, setRegions] = useState<string[]>([]);
  const [plantTypes, setPlantTypes] = useState<string[]>([]);
  const [statusTypes, setStatusTypes] = useState<string[]>([]);
  const [maxCapacityLimit, setMaxCapacityLimit] = useState(100000);

  // URL 파라미터 업데이트 함수
  const updateURLParams = (filters?: {
    search?: string;
    type?: string;
    status?: string;
    region?: string;
    minCapacity?: number;
    maxCapacity?: number;
  }) => {
    const params = new URLSearchParams(searchParams);

    if (filters) {
      // 검색어
      if (filters.search !== undefined) {
        if (filters.search) {
          params.set("search", filters.search);
        } else {
          params.delete("search");
        }
      }

      // 발전소 타입
      if (filters.type !== undefined) {
        if (filters.type && filters.type !== "전체") {
          params.set("type", filters.type);
        } else {
          params.delete("type");
        }
      }

      // 상태
      if (filters.status !== undefined) {
        if (filters.status && filters.status !== "전체") {
          params.set("status", filters.status);
        } else {
          params.delete("status");
        }
      }

      // 지역
      if (filters.region !== undefined) {
        if (filters.region && filters.region !== "전체") {
          params.set("region", filters.region);
        } else {
          params.delete("region");
        }
      }

      // 최소 용량
      if (filters.minCapacity !== undefined) {
        if (filters.minCapacity > 0) {
          params.set("minCapacity", filters.minCapacity.toString());
        } else {
          params.delete("minCapacity");
        }
      }

      // 최대 용량
      if (filters.maxCapacity !== undefined) {
        if (filters.maxCapacity < maxCapacityLimit) {
          params.set("maxCapacity", filters.maxCapacity.toString());
        } else {
          params.delete("maxCapacity");
        }
      }
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAllPlants();
        setPlants(data);
        setFilteredPlants(data);

        // 데이터에서 고유한 지역, 유형, 상태 목록 추출
        const uniqueRegions = Array.from(
          new Set(
            data.map((plant) => plant.infra.address.split(" ")[0] || "기타")
          )
        );
        const uniqueTypes = Array.from(
          new Set(data.map((plant) => plant.infra.type))
        );
        const uniqueStatus = Array.from(
          new Set(data.map((plant) => plant.status || "정상"))
        );
        const maxPlantCapacity = Math.max(
          ...data.map((plant) => plant.infra.capacity || 0)
        );

        setRegions(["전체", ...uniqueRegions]);
        setPlantTypes(["전체", ...uniqueTypes]);
        setStatusTypes(["전체", ...uniqueStatus]);
        setMaxCapacityLimit(maxPlantCapacity > 0 ? maxPlantCapacity : 100000);

        // 기본 최대 용량 설정 (처음 로드시에만)
        if (!maxCapacityParam) {
          setMaxCapacity(maxPlantCapacity > 0 ? maxPlantCapacity : 100000);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching plants:", error);
        setError("발전소 데이터를 불러오는 중 오류가 발생했습니다.");
        setLoading(false);
      }
    }

    fetchData();
  }, [maxCapacityParam]);

  // 필터 적용
  useEffect(() => {
    let result = [...plants];

    // 이름 필터
    if (nameFilter) {
      result = result.filter((plant) =>
        plant.infra.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    // 타입 필터
    if (type !== "전체") {
      result = result.filter((plant) => plant.infra.type === type);
    }

    // 상태 필터
    if (status !== "전체") {
      result = result.filter((plant) => plant.status === status);
    }

    // 지역 필터
    if (region !== "전체") {
      result = result.filter((plant) => plant.infra.address.startsWith(region));
    }

    // 용량 범위 필터
    result = result.filter(
      (plant) =>
        plant.infra.capacity >= minCapacity &&
        plant.infra.capacity <= maxCapacity
    );

    // 활성 상태 필터
    if (showActiveOnly) {
      result = result.filter(
        (plant) => plant.status === "정상" || plant.status === "가동중"
      );
    }

    setFilteredPlants(result);
  }, [
    plants,
    nameFilter,
    type,
    status,
    region,
    minCapacity,
    maxCapacity,
    showActiveOnly,
  ]);

  // 필터 초기화
  const resetFilters = () => {
    setNameFilter("");
    setType("전체");
    setStatus("전체");
    setRegion("전체");
    setMinCapacity(0);
    setMaxCapacity(maxCapacityLimit);
    setShowActiveOnly(false);

    // URL 파라미터 초기화
    updateURLParams({
      search: "",
      type: "전체",
      status: "전체",
      region: "전체",
      minCapacity: 0,
      maxCapacity: maxCapacityLimit,
    });
  };

  // 필터 적용 핸들러
  const applyFilters = () => {
    updateURLParams({
      search: nameFilter,
      type,
      status,
      region,
      minCapacity,
      maxCapacity,
    });
  };

  // 필터 핸들러
  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  // 특정 필터 제거
  const removeFilter = (filterType: string) => {
    switch (filterType) {
      case "search":
        setNameFilter("");
        break;
      case "type":
        setType("전체");
        break;
      case "status":
        setStatus("전체");
        break;
      case "region":
        setRegion("전체");
        break;
      case "minCapacity":
        setMinCapacity(0);
        break;
      case "maxCapacity":
        setMaxCapacity(maxCapacityLimit);
        break;
    }
    updateURLParams({
      [filterType]:
        filterType === "search"
          ? ""
          : filterType === "minCapacity"
          ? 0
          : filterType === "maxCapacity"
          ? maxCapacityLimit
          : "전체",
    });
  };

  // 로딩 중 상태 표시
  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>발전소 지도</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-8">
              <p>지도를 불러오는 중입니다...</p>
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
            <CardTitle>발전소 지도</CardTitle>
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

  // FilterPanel에 전달할 props 준비
  const filterValues = {
    search: nameFilter,
    type,
    status,
    region,
    minCapacity,
    maxCapacity,
    maxCapacityLimit,
  };

  const filterSetters = {
    setSearch: setNameFilter,
    setType,
    setStatus,
    setRegion,
    setMinCapacity,
    setMaxCapacity,
  };

  const filterOptions = {
    plantTypes,
    statusTypes,
    regions,
  };

  const filterHandlers = {
    onSearchSubmit,
    applyFilters,
    resetFilters,
    removeFilter,
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>발전소 지도</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative z-20">
            <FilterPanel
              values={filterValues}
              setters={filterSetters}
              options={filterOptions}
              handlers={filterHandlers}
            />
          </div>

          <div className="mb-2 text-sm text-muted-foreground">
            검색 결과: {filteredPlants.length}개의 발전소
          </div>

          <div className="h-[600px] w-full rounded-md overflow-hidden relative z-10">
            {typeof window !== "undefined" && (
              <MapContainer
                center={[36.5, 127.5]} // 한국 중심 좌표
                style={{ height: "100%", width: "100%" }}
                zoom={7}
                scrollWheelZoom={true}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredPlants.map((plant) => (
                  <Marker
                    key={plant.id}
                    position={[plant.infra.latitude, plant.infra.longitude]}
                    icon={customIcon(plant.infra.type)}
                  >
                    <Popup>
                      <div className="text-sm">
                        <h3 className="font-bold">{plant.infra.name}</h3>
                        <p>유형: {plant.infra.type}</p>
                        <p>용량: {formatNumber(plant.infra.capacity)} kW</p>
                        <p>주소: {plant.infra.address}</p>
                        <p>상태: {plant.status || "정상"}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5733] border-2 border-white"></div>
              <span className="text-sm">태양광</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#33B5FF] border-2 border-white"></div>
              <span className="text-sm">풍력</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#7D33FF] border-2 border-white"></div>
              <span className="text-sm">기타</span>
            </div>
          </div>

          <div className="mb-2 text-sm text-muted-foreground">
            총 {plants.length}개 중 {filteredPlants.length}개 표시 중
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 이 페이지는 동적으로 렌더링됩니다 (SSR)
export const dynamic = "force-dynamic";
