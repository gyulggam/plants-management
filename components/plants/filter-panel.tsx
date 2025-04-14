import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";

// 필터 값 인터페이스
interface FilterValues {
  search: string;
  type: string;
  status: string;
  region: string;
  minCapacity: number;
  maxCapacity: number;
  maxCapacityLimit: number;
}

// 필터 Setter 인터페이스
interface FilterSetters {
  setSearch: (value: string) => void;
  setType: (value: string) => void;
  setStatus: (value: string) => void;
  setRegion: (value: string) => void;
  setMinCapacity: (value: number) => void;
  setMaxCapacity: (value: number) => void;
}

// 필터 옵션 인터페이스
interface FilterOptions {
  plantTypes: string[];
  statusTypes: string[];
  regions: string[];
}

// 필터 이벤트 핸들러 인터페이스
interface FilterHandlers {
  onSearchSubmit: (e: React.FormEvent) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  removeFilter: (filterType: string) => void;
}

interface FilterPanelProps {
  values: FilterValues;
  setters: FilterSetters;
  options: FilterOptions;
  handlers: FilterHandlers;
}

export function FilterPanel({
  values,
  setters,
  options,
  handlers,
}: FilterPanelProps) {
  const {
    search,
    type,
    status,
    region,
    minCapacity,
    maxCapacity,
    maxCapacityLimit,
  } = values;
  const {
    setSearch,
    setType,
    setStatus,
    setRegion,
    setMinCapacity,
    setMaxCapacity,
  } = setters;
  const { plantTypes, statusTypes, regions } = options;
  const { onSearchSubmit, applyFilters, resetFilters, removeFilter } = handlers;

  // 활성화된 필터 개수 계산
  const getActiveFilterCount = () => {
    let count = 0;
    if (search) count++;
    if (type !== "all") count++;
    if (status !== "all") count++;
    if (region !== "all") count++;
    if (minCapacity > 0) count++;
    if (maxCapacity < maxCapacityLimit) count++;
    return count;
  };

  return (
    <>
      <form onSubmit={onSearchSubmit} className="flex items-center mb-4">
        <div className="flex gap-2 flex-1">
          <Input
            placeholder="발전소 이름, 위치, 타입 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button type="submit">검색</Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Filter className="h-4 w-4" />
                필터
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="typeFilter">발전소 유형</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="typeFilter">
                      <SelectValue placeholder="유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
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
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="statusFilter">
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
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
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger id="regionFilter">
                      <SelectValue placeholder="지역 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>설비 용량 (kW)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min="0"
                      value={minCapacity}
                      onChange={(e) =>
                        setMinCapacity(parseInt(e.target.value) || 0)
                      }
                      className="w-24"
                      placeholder="최소"
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
                      placeholder="최대"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    초기화
                  </Button>
                  <Button size="sm" onClick={applyFilters}>
                    적용
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </form>

      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {search && (
            <Badge variant="outline" className="gap-1">
              검색: {search}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter("search")}
              />
            </Badge>
          )}
          {type && type !== "all" && (
            <Badge variant="outline" className="gap-1">
              유형: {type}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter("type")}
              />
            </Badge>
          )}
          {status && status !== "all" && (
            <Badge variant="outline" className="gap-1">
              상태: {status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter("status")}
              />
            </Badge>
          )}
          {region && region !== "all" && (
            <Badge variant="outline" className="gap-1">
              지역: {region}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter("region")}
              />
            </Badge>
          )}
          {minCapacity > 0 && (
            <Badge variant="outline" className="gap-1">
              최소 용량: {minCapacity}kW
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter("minCapacity")}
              />
            </Badge>
          )}
          {maxCapacity < maxCapacityLimit && (
            <Badge variant="outline" className="gap-1">
              최대 용량: {maxCapacity}kW
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeFilter("maxCapacity")}
              />
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-6 px-2 text-xs"
          >
            모두 초기화
          </Button>
        </div>
      )}
    </>
  );
}
