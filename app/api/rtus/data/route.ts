import { NextResponse } from "next/server";

// RTU 데이터 인터페이스
interface RTUSocketData {
  id: string;
  timestamp: string;
  status: "online" | "offline" | "warning" | "error";
  batteryLevel: number | null;
  signalStrength: number | null;
  values: {
    [key: string]: number | string | boolean | null;
  };
}

// RTU 데이터 캐시 (실제로는 DB나 Redis 등에 저장할 수 있음)
const rtuDataCache = new Map<string, RTUSocketData>();

// RTU 데이터 생성 함수
const generateFakeRTUData = (rtuId: string): RTUSocketData => {
  const statuses = ["online", "offline", "warning", "error"] as const;
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  const batteryLevel =
    randomStatus === "offline" ? null : Math.floor(Math.random() * 100);
  const signalStrength =
    randomStatus === "offline"
      ? null
      : -1 * Math.floor(Math.random() * 100 + 30);

  return {
    id: rtuId,
    timestamp: new Date().toISOString(),
    status: randomStatus,
    batteryLevel,
    signalStrength,
    values: {
      temperature: parseFloat((Math.random() * 50).toFixed(1)),
      humidity: parseFloat((Math.random() * 100).toFixed(1)),
      power: parseFloat((Math.random() * 1000).toFixed(2)),
      voltage: parseFloat((220 + Math.random() * 10).toFixed(1)),
      current: parseFloat((Math.random() * 10).toFixed(2)),
    },
  };
};

// 모든 RTU에 대해 임의 데이터 주기적 업데이트
["0001", "0002", "0003", "0004", "0005"].forEach((rtuId) => {
  // 최초 데이터 생성
  rtuDataCache.set(rtuId, generateFakeRTUData(rtuId));

  // 서버 side에서 주기적으로 데이터 업데이트 (서버 측 메모리에 저장)
  if (typeof window === "undefined") {
    // 서버 사이드에서만 실행
    setInterval(() => {
      rtuDataCache.set(rtuId, generateFakeRTUData(rtuId));
    }, 3000 + Math.random() * 5000); // 3~8초 간격으로 랜덤 업데이트
  }
});

export async function GET(request: Request) {
  // 특정 RTU ID가 요청된 경우
  const { searchParams } = new URL(request.url);
  const rtuId = searchParams.get("id");

  if (rtuId) {
    const data = rtuDataCache.get(rtuId);
    return NextResponse.json(data || { error: "RTU not found" });
  }

  // 모든 RTU 데이터 반환
  return NextResponse.json(Object.fromEntries(rtuDataCache));
}
