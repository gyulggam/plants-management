"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { PowerPlant } from "@/types/power-plant";
import { getAllPlants } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

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
  const [plants, setPlants] = useState<PowerPlant[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<PowerPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 필터 상태
  const [nameFilter, setNameFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("전체");
  const [statusFilter, setStatusFilter] = useState<string>("전체");
  const [regionFilter, setRegionFilter] = useState<string>("전체");
  const [minCapacity, setMinCapacity] = useState(0);
  const [maxCapacity, setMaxCapacity] = useState(100000);
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  // 고유한 지역 및 발전소 유형 목록 (데이터에서 추출)
  const [regions, setRegions] = useState<string[]>([]);
  const [plantTypes, setPlantTypes] = useState<string[]>([]);
  const [statusTypes, setStatusTypes] = useState<string[]>([]);
  const [maxCapacityLimit, setMaxCapacityLimit] = useState(100000);

  // 필터 패널 상태
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  // 활성화된 필터 개수 계산
  const getActiveFilterCount = () => {
    let count = 0;
    if (nameFilter) count++;
    if (typeFilter !== "전체") count++;
    if (statusFilter !== "전체") count++;
    if (regionFilter !== "전체") count++;
    if (minCapacity > 0) count++;
    if (maxCapacity < maxCapacityLimit) count++;
    if (showActiveOnly) count++;
    return count;
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
        setMaxCapacity(maxPlantCapacity > 0 ? maxPlantCapacity : 100000);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching plants:", error);
        setError("발전소 데이터를 불러오는 중 오류가 발생했습니다.");
        setLoading(false);
      }
    }

    fetchData();
  }, []);

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
    if (typeFilter !== "전체") {
      result = result.filter((plant) => plant.infra.type === typeFilter);
    }

    // 상태 필터
    if (statusFilter !== "전체") {
      result = result.filter((plant) => plant.status === statusFilter);
    }

    // 지역 필터
    if (regionFilter !== "전체") {
      result = result.filter((plant) =>
        plant.infra.address.startsWith(regionFilter)
      );
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
    typeFilter,
    statusFilter,
    regionFilter,
    minCapacity,
    maxCapacity,
    showActiveOnly,
  ]);

  // 필터 초기화
  const resetFilters = () => {
    setNameFilter("");
    setTypeFilter("전체");
    setStatusFilter("전체");
    setRegionFilter("전체");
    setMinCapacity(0);
    setMaxCapacity(maxCapacityLimit);
    setShowActiveOnly(false);
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>발전소 지도</CardTitle>
            <Collapsible
              open={isFilterOpen}
              onOpenChange={setIsFilterOpen}
              className="w-full"
            >
              <div className="flex items-center space-x-2">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Filter className="h-4 w-4" />
                    필터
                    {getActiveFilterCount() > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {getActiveFilterCount()}
                      </Badge>
                    )}
                    {isFilterOpen ? (
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : null}
                  </Button>
                </CollapsibleTrigger>
                {getActiveFilterCount() > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-xs"
                  >
                    초기화
                  </Button>
                )}
              </div>
              <CollapsibleContent className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="nameFilter">발전소 이름</Label>
                    <Input
                      id="nameFilter"
                      placeholder="발전소 이름 검색"
                      value={nameFilter}
                      onChange={(e) => setNameFilter(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="typeFilter">발전소 유형</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger id="typeFilter">
                        <SelectValue placeholder="유형 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {plantTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="statusFilter">운영 상태</Label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger id="statusFilter">
                        <SelectValue placeholder="상태 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusTypes.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regionFilter">지역</Label>
                    <Select
                      value={regionFilter}
                      onValueChange={setRegionFilter}
                    >
                      <SelectTrigger id="regionFilter">
                        <SelectValue placeholder="지역 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>설비 용량 (kW)</Label>
                      <span className="text-sm text-muted-foreground">
                        {minCapacity} - {maxCapacity} kW
                      </span>
                    </div>
                    <div className="flex items-center gap-4 py-4">
                      <Input
                        type="number"
                        min="0"
                        value={minCapacity}
                        onChange={(e) =>
                          setMinCapacity(parseInt(e.target.value) || 0)
                        }
                        className="w-24"
                      />
                      <div className="grow text-center">~</div>
                      <Input
                        type="number"
                        min="0"
                        value={maxCapacity}
                        onChange={(e) =>
                          setMaxCapacity(parseInt(e.target.value) || 0)
                        }
                        className="w-24"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showActiveOnly"
                      checked={showActiveOnly}
                      onCheckedChange={setShowActiveOnly}
                    />
                    <Label htmlFor="showActiveOnly">
                      가동 중인 발전소만 표시
                    </Label>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {nameFilter && (
              <Badge variant="outline" className="gap-1">
                이름: {nameFilter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setNameFilter("")}
                />
              </Badge>
            )}
            {typeFilter !== "전체" && (
              <Badge variant="outline" className="gap-1">
                유형: {typeFilter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setTypeFilter("전체")}
                />
              </Badge>
            )}
            {statusFilter !== "전체" && (
              <Badge variant="outline" className="gap-1">
                상태: {statusFilter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setStatusFilter("전체")}
                />
              </Badge>
            )}
            {regionFilter !== "전체" && (
              <Badge variant="outline" className="gap-1">
                지역: {regionFilter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setRegionFilter("전체")}
                />
              </Badge>
            )}
            {minCapacity > 0 && (
              <Badge variant="outline" className="gap-1">
                최소 용량: {minCapacity}kW
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setMinCapacity(0)}
                />
              </Badge>
            )}
            {maxCapacity < maxCapacityLimit && (
              <Badge variant="outline" className="gap-1">
                최대 용량: {maxCapacity}kW
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setMaxCapacity(maxCapacityLimit)}
                />
              </Badge>
            )}
            {showActiveOnly && (
              <Badge variant="outline" className="gap-1">
                가동중인 발전소만
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setShowActiveOnly(false)}
                />
              </Badge>
            )}
          </div>

          <div className="mb-2 text-sm text-muted-foreground">
            검색 결과: {filteredPlants.length}개의 발전소
          </div>

          <div className="h-[600px] w-full rounded-md overflow-hidden">
            {typeof window !== "undefined" && (
              <MapContainer
                center={[36.5, 127.5]} // 한국 중심 좌표
                style={{ height: "100%", width: "100%" }}
                zoom={7}
                scrollWheelZoom={true}
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
                        <p>용량: {plant.infra.capacity} kW</p>
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
        </CardContent>
      </Card>
    </div>
  );
}
