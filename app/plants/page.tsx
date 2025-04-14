"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PowerPlant } from "@/types/power-plant";
import { useEffect, useState } from "react";
import { getAllPlants } from "@/lib/api";
import { Pagination } from "@/components/ui/pagination";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FilterPanel } from "@/components/plants/filter-panel";
import { PlusCircle } from "lucide-react";

export default function PlantsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL에서 파라미터 가져오기
  const currentPage = Number(searchParams.get("page") || "1");
  const searchTerm = searchParams.get("search") || "";
  const typeFilter = searchParams.get("type") || "";
  const statusFilter = searchParams.get("status") || "";
  const regionFilter = searchParams.get("region") || "";
  const minCapacityParam = searchParams.get("minCapacity");
  const maxCapacityParam = searchParams.get("maxCapacity");
  const pageSize = 10;

  // 상태 관리
  const [plants, setPlants] = useState<PowerPlant[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<PowerPlant[]>([]);
  const [allFilteredResults, setAllFilteredResults] = useState<PowerPlant[]>(
    []
  ); // 전체 필터링된 결과
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setTotalPages] = useState(1);

  // 필터 상태
  const [search, setSearch] = useState(searchTerm);
  const [type, setType] = useState(typeFilter || "all");
  const [status, setStatus] = useState(statusFilter || "all");
  const [region, setRegion] = useState(regionFilter || "all");
  const [minCapacity, setMinCapacity] = useState(
    minCapacityParam ? parseInt(minCapacityParam) : 0
  );
  const [maxCapacity, setMaxCapacity] = useState(
    maxCapacityParam ? parseInt(maxCapacityParam) : 100000
  );

  // 데이터에서 필터 옵션 목록 추출
  const [plantTypes, setPlantTypes] = useState<string[]>([]);
  const [statusTypes, setStatusTypes] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [maxCapacityLimit, setMaxCapacityLimit] = useState(100000);

  // URL 파라미터 업데이트 함수
  const updateURLParams = (
    page: number,
    filters?: {
      search?: string;
      type?: string;
      status?: string;
      region?: string;
      minCapacity?: number;
      maxCapacity?: number;
    }
  ) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());

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
        if (filters.type) {
          params.set("type", filters.type);
        } else {
          params.delete("type");
        }
      }

      // 상태
      if (filters.status !== undefined) {
        if (filters.status) {
          params.set("status", filters.status);
        } else {
          params.delete("status");
        }
      }

      // 지역
      if (filters.region !== undefined) {
        if (filters.region) {
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

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    updateURLParams(page);
  };

  // 검색 실행 핸들러
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateURLParams(1, { search });
  };

  // 필터 적용 핸들러
  const applyFilters = () => {
    updateURLParams(1, {
      search,
      type,
      status,
      region,
      minCapacity,
      maxCapacity,
    });
  };

  // 필터 초기화
  const resetFilters = () => {
    setSearch("");
    setType("all");
    setStatus("all");
    setRegion("all");
    setMinCapacity(0);
    setMaxCapacity(maxCapacityLimit);

    updateURLParams(1, {
      search: "",
      type: "all",
      status: "all",
      region: "all",
      minCapacity: 0,
      maxCapacity: maxCapacityLimit,
    });
  };

  // 개별 필터 제거
  const removeFilter = (filterType: string) => {
    switch (filterType) {
      case "search":
        setSearch("");
        updateURLParams(1, { search: "" });
        break;
      case "type":
        setType("all");
        updateURLParams(1, { type: "all" });
        break;
      case "status":
        setStatus("all");
        updateURLParams(1, { status: "all" });
        break;
      case "region":
        setRegion("all");
        updateURLParams(1, { region: "all" });
        break;
      case "minCapacity":
        setMinCapacity(0);
        updateURLParams(1, { minCapacity: 0 });
        break;
      case "maxCapacity":
        setMaxCapacity(maxCapacityLimit);
        updateURLParams(1, { maxCapacity: maxCapacityLimit });
        break;
    }
  };

  // 데이터 로드
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // 모든 발전소 데이터 가져오기 (필터링을 위해)
        const allPlants = await getAllPlants();
        setPlants(allPlants);

        // 데이터에서 고유한 지역, 유형, 상태 목록 추출
        const uniqueRegions = Array.from(
          new Set(
            allPlants.map(
              (plant) => plant.infra.address.split(" ")[0] || "기타"
            )
          )
        );
        const uniqueTypes = Array.from(
          new Set(allPlants.map((plant) => plant.infra.type))
        );
        const uniqueStatus = Array.from(
          new Set(allPlants.map((plant) => plant.status || "정상"))
        );
        const maxPlantCapacity = Math.max(
          ...allPlants.map((plant) => plant.infra.capacity || 0)
        );

        setRegions(uniqueRegions);
        setPlantTypes(uniqueTypes);
        setStatusTypes(uniqueStatus);
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
  }, []); // currentPage 의존성 제거하여 한 번만 로드하도록 함

  // 필터링 적용
  useEffect(() => {
    let result = [...plants];

    // 이름/검색어 필터
    if (search) {
      result = result.filter(
        (plant) =>
          plant.infra.name.toLowerCase().includes(search.toLowerCase()) ||
          plant.infra.address.toLowerCase().includes(search.toLowerCase()) ||
          plant.infra.type.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 타입 필터
    if (type && type !== "all") {
      result = result.filter((plant) => plant.infra.type === type);
    }

    // 상태 필터
    if (status && status !== "all") {
      result = result.filter((plant) => plant.status === status);
    }

    // 지역 필터
    if (region && region !== "all") {
      result = result.filter((plant) => plant.infra.address.startsWith(region));
    }

    // 용량 범위 필터
    result = result.filter(
      (plant) =>
        plant.infra.capacity >= minCapacity &&
        plant.infra.capacity <= maxCapacity
    );

    // 전체 필터링된 결과 저장
    setAllFilteredResults(result);

    // 총 페이지 수 계산
    const calculatedTotalPages = Math.max(
      Math.ceil(result.length / pageSize),
      1
    );

    setTotalPages(calculatedTotalPages);

    // 페이지별로 데이터 슬라이싱 (간단한 페이지네이션)
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageData = result.slice(startIndex, endIndex);

    setFilteredPlants(pageData);
  }, [
    plants,
    search,
    type,
    status,
    region,
    minCapacity,
    maxCapacity,
    currentPage,
    pageSize,
  ]);

  // 로딩 중 상태 표시
  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>발전소 관리</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-8">
              <p>데이터를 불러오는 중입니다...</p>
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
            <CardTitle>발전소 관리</CardTitle>
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

  // 직접 계산된 totalPages - 필터링된 결과 기준
  const directTotalPages = Math.max(
    Math.ceil(allFilteredResults.length / pageSize),
    1
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>발전소 관리</CardTitle>
            <Button onClick={() => router.push("/plants/new")}>
              <PlusCircle className="h-4 w-4 mr-2" />새 발전소 등록
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <FilterPanel
            values={{
              search,
              type,
              status,
              region,
              minCapacity,
              maxCapacity,
              maxCapacityLimit,
            }}
            setters={{
              setSearch,
              setType,
              setStatus,
              setRegion,
              setMinCapacity,
              setMaxCapacity,
            }}
            options={{
              plantTypes,
              statusTypes,
              regions,
            }}
            handlers={{
              onSearchSubmit: handleSearchSubmit,
              applyFilters,
              resetFilters,
              removeFilter,
            }}
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>위치</TableHead>
                <TableHead>종류</TableHead>
                <TableHead>용량 (kW)</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    검색 결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlants.map((plant) => (
                  <TableRow
                    key={plant.id}
                    className="cursor-pointer hover:bg-muted/50 h-14"
                    onClick={() => router.push(`/plants/${plant.id}`)}
                  >
                    <TableCell className="font-medium">
                      {plant.infra.name}
                    </TableCell>
                    <TableCell>{plant.infra.address}</TableCell>
                    <TableCell>{plant.infra.type}</TableCell>
                    <TableCell>{plant.infra.capacity}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${
                          plant.status === "정상" || plant.status === "가동중"
                            ? "bg-green-100 text-green-800"
                            : plant.status === "점검중"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {plant.status || "정상"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              총 {filteredPlants.length}개 표시 중 (전체{" "}
              {allFilteredResults.length}개) | 총 페이지 수: {directTotalPages}{" "}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={directTotalPages} // 필터링된 결과 기준으로 직접 계산된 값 사용
              onPageChange={handlePageChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
