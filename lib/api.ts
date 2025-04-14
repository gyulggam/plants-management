import { PowerPlant } from "@/types/power-plant";

interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
  meta?: Record<string, unknown>;
  message?: string;
}

// 모든 발전소 목록 가져오기
export async function getAllPlants(): Promise<PowerPlant[]> {
  const response = await fetch("/api/plants");

  if (!response.ok) {
    throw new Error("발전소 데이터를 가져오는 중 오류가 발생했습니다.");
  }

  const result = (await response.json()) as ApiResponse<PowerPlant[]>;

  if (result.status === "error") {
    throw new Error(
      result.message || "발전소 데이터를 가져오는 중 오류가 발생했습니다."
    );
  }

  return result.data;
}

// 특정 ID의 발전소 가져오기
export async function getPlantById(id: number): Promise<PowerPlant> {
  const response = await fetch(`/api/plants/${id}`);

  if (!response.ok) {
    throw new Error(`ID가 ${id}인 발전소를 찾을 수 없습니다.`);
  }

  const result = (await response.json()) as ApiResponse<PowerPlant>;

  if (result.status === "error") {
    throw new Error(
      result.message || `ID가 ${id}인 발전소를 찾을 수 없습니다.`
    );
  }

  return result.data;
}

// 특정 타입의 발전소 가져오기
export async function getPlantsByType(type: string): Promise<PowerPlant[]> {
  const response = await fetch(
    `/api/plants/by-type/${encodeURIComponent(type)}`
  );

  if (!response.ok) {
    throw new Error(
      `${type} 타입의 발전소 데이터를 가져오는 중 오류가 발생했습니다.`
    );
  }

  const result = (await response.json()) as ApiResponse<PowerPlant[]>;

  if (result.status === "error") {
    throw new Error(
      result.message ||
        `${type} 타입의 발전소 데이터를 가져오는 중 오류가 발생했습니다.`
    );
  }

  return result.data;
}

// 페이지네이션된 발전소 목록 가져오기
export async function getPaginatedPlants(
  page: number = 1,
  limit: number = 10
): Promise<{
  plants: PowerPlant[];
  total: number;
  totalPages: number;
  currentPage: number;
}> {
  const response = await fetch(`/api/plants?page=${page}&limit=${limit}`);

  if (!response.ok) {
    throw new Error("발전소 데이터를 가져오는 중 오류가 발생했습니다.");
  }

  const result = (await response.json()) as ApiResponse<PowerPlant[]>;

  if (result.status === "error") {
    throw new Error(
      result.message || "발전소 데이터를 가져오는 중 오류가 발생했습니다."
    );
  }

  return {
    plants: result.data,
    total: (result.meta?.total as number) || 0,
    totalPages: (result.meta?.totalPages as number) || 1,
    currentPage: (result.meta?.page as number) || 1,
  };
}

// 페이지네이션된 타입별 발전소 목록 가져오기
export async function getPaginatedPlantsByType(
  type: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  plants: PowerPlant[];
  total: number;
  totalPages: number;
  currentPage: number;
  filterType: string;
}> {
  const response = await fetch(
    `/api/plants/by-type/${encodeURIComponent(
      type
    )}?page=${page}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error(
      `${type} 타입의 발전소 데이터를 가져오는 중 오류가 발생했습니다.`
    );
  }

  const result = (await response.json()) as ApiResponse<PowerPlant[]>;

  if (result.status === "error") {
    throw new Error(
      result.message ||
        `${type} 타입의 발전소 데이터를 가져오는 중 오류가 발생했습니다.`
    );
  }

  return {
    plants: result.data,
    total: (result.meta?.total as number) || 0,
    totalPages: (result.meta?.totalPages as number) || 1,
    currentPage: (result.meta?.page as number) || 1,
    filterType: (result.meta?.filterType as string) || type,
  };
}

// 검색 및 필터링 API
export async function searchPlants(params: {
  query?: string;
  type?: string;
  minCapacity?: number;
  maxCapacity?: number;
  contractType?: string;
  page?: number;
  limit?: number;
}): Promise<{
  plants: PowerPlant[];
  total: number;
  totalPages: number;
  currentPage: number;
  filters: Record<string, unknown>;
}> {
  // 쿼리 파라미터 생성
  const searchParams = new URLSearchParams();

  // 필수 파라미터가 아닌 것들만 조건부로 추가
  if (params.query) searchParams.set("q", params.query);
  if (params.type) searchParams.set("type", params.type);
  if (params.minCapacity !== undefined)
    searchParams.set("minCapacity", params.minCapacity.toString());
  if (params.maxCapacity !== undefined)
    searchParams.set("maxCapacity", params.maxCapacity.toString());
  if (params.contractType)
    searchParams.set("contractType", params.contractType);

  // 페이지네이션 파라미터
  searchParams.set("page", (params.page || 1).toString());
  searchParams.set("limit", (params.limit || 10).toString());

  const response = await fetch(`/api/plants/search?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error("발전소 검색 중 오류가 발생했습니다.");
  }

  const result = (await response.json()) as ApiResponse<PowerPlant[]>;

  if (result.status === "error") {
    throw new Error(result.message || "발전소 검색 중 오류가 발생했습니다.");
  }

  return {
    plants: result.data,
    total: (result.meta?.total as number) || 0,
    totalPages: (result.meta?.totalPages as number) || 1,
    currentPage: (result.meta?.page as number) || 1,
    filters: (result.meta?.filters as Record<string, unknown>) || {},
  };
}

/**
 * 새 발전소 생성
 */
export async function createPlant(
  newPlant: Partial<PowerPlant>
): Promise<PowerPlant> {
  const response = await fetch(`/api/plants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newPlant),
  });

  if (!response.ok) {
    throw new Error("발전소 생성 중 오류가 발생했습니다.");
  }

  const result = (await response.json()) as ApiResponse<PowerPlant>;

  if (result.status === "error") {
    throw new Error(result.message || "발전소 생성 중 오류가 발생했습니다.");
  }

  return result.data;
}

/**
 * 발전소 정보 수정
 */
export async function updatePlant(
  id: number,
  plant: Partial<PowerPlant>
): Promise<PowerPlant> {
  const response = await fetch(`/api/plants/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(plant),
  });

  if (!response.ok) {
    throw new Error(`발전소 ID: ${id} 수정 중 오류가 발생했습니다.`);
  }

  const result = (await response.json()) as ApiResponse<PowerPlant>;

  if (result.status === "error") {
    throw new Error(
      result.message || `발전소 ID: ${id} 수정 중 오류가 발생했습니다.`
    );
  }

  return result.data;
}

/**
 * 발전소 삭제
 */
export async function deletePlant(id: number): Promise<void> {
  const response = await fetch(`/api/plants/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`발전소 ID: ${id} 삭제 중 오류가 발생했습니다.`);
  }

  const result = (await response.json()) as ApiResponse<void>;

  if (result.status === "error") {
    throw new Error(
      result.message || `발전소 ID: ${id} 삭제 중 오류가 발생했습니다.`
    );
  }
}
