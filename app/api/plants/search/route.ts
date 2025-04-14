import { NextResponse } from "next/server";
import { fakePlants } from "../data/fake-generator";

export async function GET(request: Request) {
  // 인위적인 지연 추가 (API 호출 시뮬레이션)
  await new Promise((resolve) => setTimeout(resolve, 400));

  // URL에서 쿼리 파라미터 가져오기
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";
  const type = url.searchParams.get("type") || "";
  const minCapacity = parseInt(url.searchParams.get("minCapacity") || "0");
  const maxCapacity = parseInt(url.searchParams.get("maxCapacity") || "999999");
  const contractType = url.searchParams.get("contractType") || "";

  // 페이지네이션
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  // 필터링된 데이터
  let filteredData = [...fakePlants];

  // 이름 또는 주소로 검색
  if (query) {
    const lowerQuery = query.toLowerCase();
    filteredData = filteredData.filter(
      (plant) =>
        plant.infra.name.toLowerCase().includes(lowerQuery) ||
        plant.infra.address.toLowerCase().includes(lowerQuery)
    );
  }

  // 유형으로 필터링
  if (type) {
    filteredData = filteredData.filter((plant) => plant.infra.type === type);
  }

  // 용량으로 필터링
  filteredData = filteredData.filter(
    (plant) =>
      plant.infra.capacity >= minCapacity && plant.infra.capacity <= maxCapacity
  );

  // 계약 유형으로 필터링
  if (contractType) {
    filteredData = filteredData.filter(
      (plant) => plant.contract.contract_type === contractType
    );
  }

  // 페이지네이션
  const paginatedData = filteredData.slice(offset, offset + limit);
  const totalCount = filteredData.length;
  const totalPages = Math.ceil(totalCount / limit);

  return NextResponse.json({
    status: "success",
    data: paginatedData,
    meta: {
      total: totalCount,
      page,
      limit,
      totalPages,
      filters: {
        query,
        type,
        minCapacity,
        maxCapacity,
        contractType,
      },
    },
  });
}
