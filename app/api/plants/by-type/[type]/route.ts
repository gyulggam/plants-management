import { NextResponse } from "next/server";
import { filterPlantsByType } from "../../data/utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  // URL 파라미터 처리
  const url = new URL(request.url);
  // 페이지 기반 페이지네이션
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  try {
    const resolvedParams = await params;

    // 발전소 유형으로 필터링
    const filteredPlants = filterPlantsByType(resolvedParams.type);

    // 데이터 페이지네이션
    const paginatedPlants = filteredPlants.slice(offset, offset + limit);
    const totalItems = filteredPlants.length;
    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      status: "success",
      data: paginatedPlants,
      meta: {
        total: totalItems,
        page,
        limit,
        totalPages,
        filterType: resolvedParams.type,
      },
    });
  } catch (error) {
    const resolvedParams = await params;
    console.error(
      `Error filtering plants by type ${resolvedParams.type}:`,
      error
    );
    return NextResponse.json(
      {
        status: "error",
        message: `${resolvedParams.type} 유형의 발전소 데이터를 가져오는 중 오류가 발생했습니다.`,
      },
      { status: 500 }
    );
  }
}
