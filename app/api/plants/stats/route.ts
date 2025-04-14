import { NextResponse } from "next/server";
import { aggregateByType } from "../data/utils";
import { fakePlants } from "../data/fake-generator";

export async function GET() {
  // 인위적인 지연 추가 (API 호출 시뮬레이션)
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 발전소 유형별 통계 계산
  const typeStats = aggregateByType();

  // 총 용량 계산
  const totalCapacity = fakePlants.reduce(
    (sum, plant) => sum + plant.infra.capacity,
    0
  );

  // 총 개수
  const totalCount = fakePlants.length;

  // 계약 유형별 개수
  const contractTypeCount = new Map<string, number>();
  fakePlants.forEach((plant) => {
    const type = plant.contract.contract_type;
    contractTypeCount.set(type, (contractTypeCount.get(type) || 0) + 1);
  });

  return NextResponse.json({
    status: "success",
    data: {
      byType: typeStats,
      total: {
        count: totalCount,
        capacity: totalCapacity,
      },
      byContractType: Object.fromEntries(contractTypeCount),
    },
  });
}
