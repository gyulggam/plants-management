"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { getRTUs } from "@/lib/api";
import { RTU } from "@/types/rtu";

export default function RTUsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [rtus, setRTUs] = useState<RTU[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [manufacturerFilter, setManufacturerFilter] = useState<string>("");

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // RTU 목록 가져오기 (useCallback 사용)
  const fetchRTUs = useCallback(async () => {
    setLoading(true);
    try {
      const pageParam = searchParams?.get("page");
      const statusParam = searchParams?.get("status");
      const manufacturerParam = searchParams?.get("manufacturer");

      const currentPage = pageParam ? parseInt(pageParam) : page;
      const currentStatus = statusParam || statusFilter;
      const currentManufacturer = manufacturerParam || manufacturerFilter;

      const params: {
        page: number;
        limit: number;
        status?: string;
        manufacturer?: string;
      } = {
        page: currentPage,
        limit,
      };

      if (currentStatus && currentStatus !== "all")
        params.status = currentStatus;
      if (currentManufacturer) params.manufacturer = currentManufacturer;

      const result = await getRTUs(params);
      setRTUs(result.data);
      setTotal(result.meta.total);
      setTotalPages(result.meta.totalPages);
    } catch (error) {
      console.error("RTU 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [searchParams, page, statusFilter, manufacturerFilter, limit]);

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    const pageParam = searchParams?.get("page");
    const statusParam = searchParams?.get("status");
    const manufacturerParam = searchParams?.get("manufacturer");

    if (pageParam) setPage(parseInt(pageParam));
    if (statusParam) setStatusFilter(statusParam);
    if (manufacturerParam) setManufacturerFilter(manufacturerParam);

    fetchRTUs();
  }, [searchParams, fetchRTUs]);

  // 필터 적용
  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set("page", "1");

    if (statusFilter && statusFilter !== "all")
      params.set("status", statusFilter);
    if (manufacturerFilter) params.set("manufacturer", manufacturerFilter);

    router.push(`/rtus?${params.toString()}`);
  };

  // 페이지 이동
  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    setPage(newPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());

    router.push(`/rtus?${params.toString()}`);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">RTU 관리</h1>
          <p className="text-muted-foreground">
            발전소의 원격 데이터 수집 장치(RTU) 목록
          </p>
        </div>
        <Button onClick={() => router.push("/rtus/new")}>
          <Plus className="mr-2 h-4 w-4" /> 새 RTU 등록
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>필터</CardTitle>
          <CardDescription>조건에 맞는 RTU 검색</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                  <SelectItem value="maintenance">유지보수</SelectItem>
                  <SelectItem value="error">오류</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="제조사 검색"
                value={manufacturerFilter}
                onChange={(e) => setManufacturerFilter(e.target.value)}
              />
            </div>
            <div>
              <Button onClick={applyFilters}>
                <Search className="mr-2 h-4 w-4" /> 검색
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>RTU 목록</CardTitle>
          <CardDescription>
            총 {total}개의 RTU 중 {rtus.length}개 표시
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>모델</TableHead>
                  <TableHead>제조사</TableHead>
                  <TableHead>통신 프로토콜</TableHead>
                  <TableHead>연결 발전소</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-[50px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[150px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[120px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[150px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[60px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-[80px]" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : rtus.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6">
                      등록된 RTU가 없거나 검색 결과가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  rtus.map((rtu) => (
                    <TableRow
                      key={rtu.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/rtus/${rtu.id}`)}
                    >
                      <TableCell className="font-medium">{rtu.id}</TableCell>
                      <TableCell>{rtu.name}</TableCell>
                      <TableCell>{rtu.model}</TableCell>
                      <TableCell>{rtu.manufacturer}</TableCell>
                      <TableCell>{rtu.communication_protocol}</TableCell>
                      <TableCell>
                        {rtu.plant_name || "연결된 발전소 없음"}
                      </TableCell>
                      <TableCell>{getStatusBadge(rtu.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/rtus/${rtu.id}/edit`);
                          }}
                        >
                          편집
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="mx-4">
                페이지 {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
