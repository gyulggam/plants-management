"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RTUBatteryChart,
  RTUSignalChart,
  RTUValuesBarChart,
} from "@/components/charts/rtu-charts";

// RTU 데이터 인터페이스
interface RTUData {
  id: string;
  name: string;
  battery: number;
  signal: number;
  status: "online" | "offline" | "warning";
  lastUpdate: string;
}

// 서버 API 응답 타입
interface APIResponseRTUData {
  id: string;
  timestamp: string;
  status: "online" | "offline" | "warning" | "error";
  batteryLevel: number | null;
  signalStrength: number | null;
  values: Record<string, number | string | boolean | null>;
}

export default function RTUMonitorPage() {
  const [rtuData, setRtuData] = useState<Map<string, RTUData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedRTUs, setSelectedRTUs] = useState<Set<string>>(new Set());
  const [allRTUs, setAllRTUs] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("연결 중...");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 주기적으로 데이터 가져오기
  useEffect(() => {
    console.log("RTU 데이터 모니터링 시작...");

    // 초기 데이터 로드
    fetchRTUData();

    // 3초마다 데이터 갱신
    const intervalId = setInterval(fetchRTUData, 3000);

    // 정리 함수
    return () => {
      console.log("RTU 데이터 모니터링 중지");
      clearInterval(intervalId);
    };
  }, []);

  // API에서 RTU 데이터 가져오기
  const fetchRTUData = async () => {
    try {
      const response = await fetch("/api/rtus/data");
      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }

      const data = await response.json();
      setLastUpdated(new Date());

      // 데이터 처리
      const newMap = new Map<string, RTUData>();
      Object.entries(data).forEach(([id, rawData]) => {
        // 타입 단언으로 API 응답 데이터 타입 지정
        const rtuData = rawData as APIResponseRTUData;
        newMap.set(id, {
          id,
          name: `RTU-${id}`,
          battery: rtuData.batteryLevel !== null ? rtuData.batteryLevel : 0,
          signal:
            rtuData.signalStrength !== null
              ? Math.abs(rtuData.signalStrength)
              : 0,
          status: rtuData.status === "error" ? "warning" : rtuData.status,
          lastUpdate: rtuData.timestamp,
        });
      });

      setRtuData(newMap);
      const rtuIds = Array.from(newMap.keys());
      setAllRTUs(rtuIds);

      // 연결 상태 업데이트
      setConnectionStatus("연결됨: API");
      setLoading(false);
    } catch (error) {
      console.error("API 요청 오류:", error);
      setConnectionStatus(
        `오류: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  };

  // RTU 선택 처리
  const toggleRTUSelection = (rtuId: string) => {
    setSelectedRTUs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rtuId)) {
        newSet.delete(rtuId);
      } else {
        newSet.add(rtuId);
      }
      return newSet;
    });
  };

  // 배터리 상태에 따른 색상
  const getBatteryColor = (level: number, forIndicator = false) => {
    if (level > 70) return forIndicator ? "bg-green-500" : "text-green-500";
    if (level > 30) return forIndicator ? "bg-yellow-500" : "text-yellow-500";
    return forIndicator ? "bg-red-500" : "text-red-500";
  };

  // 신호 강도에 따른 색상
  const getSignalColor = (level: number, forIndicator = false) => {
    if (level > 70) return forIndicator ? "bg-green-500" : "text-green-500";
    if (level > 30) return forIndicator ? "bg-blue-500" : "text-blue-500";
    return forIndicator ? "bg-red-500" : "text-red-500";
  };

  // 상태에 따른 배지 색상
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge className="bg-green-500">온라인</Badge>;
      case "offline":
        return <Badge className="bg-red-500">오프라인</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500">경고</Badge>;
      default:
        return <Badge className="bg-gray-500">알 수 없음</Badge>;
    }
  };

  // 더미 RTU 데이터 추가 (디버깅용)
  const addDummyRTUData = () => {
    const dummyId = Math.random().toString(36).substring(7);
    const statuses: ("online" | "offline" | "warning")[] = [
      "online",
      "offline",
      "warning",
    ];
    const dummyData: RTUData = {
      id: dummyId,
      name: `RTU-${dummyId}`,
      battery: Math.floor(Math.random() * 100),
      signal: Math.floor(Math.random() * 100),
      status: statuses[Math.floor(Math.random() * 3)],
      lastUpdate: new Date().toISOString(),
    };

    setRtuData((prev) => {
      const newMap = new Map(prev);
      newMap.set(dummyId, dummyData);
      return newMap;
    });

    setAllRTUs((prev) => [...prev, dummyId]);

    if (selectedRTUs.size === 0) {
      setSelectedRTUs(new Set([dummyId]));
    }
  };

  // 데이터 수동 새로고침
  const handleRefresh = () => {
    setConnectionStatus("새로고침 중...");
    fetchRTUData();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-gray-100 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">RTU 실시간 모니터링</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              마지막 업데이트:{" "}
              {lastUpdated ? lastUpdated.toLocaleTimeString() : "업데이트 없음"}
            </div>
            <Badge
              variant={
                connectionStatus.includes("연결됨") ? "outline" : "destructive"
              }
            >
              {connectionStatus}
            </Badge>
            <button
              onClick={handleRefresh}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
            >
              새로고침
            </button>
            <button
              onClick={addDummyRTUData}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
            >
              테스트 데이터 추가
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 사이드바 - RTU 선택 */}
        <div className="w-64 bg-gray-100 p-4 border-r overflow-auto">
          <h3 className="font-medium mb-4">
            모니터링할 RTU 선택 ({allRTUs.length})
          </h3>
          {loading && allRTUs.length === 0 ? (
            // 로딩 상태 표시
            Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="mb-2">
                  <Skeleton className="h-8 w-full" />
                </div>
              ))
          ) : (
            <div className="space-y-2">
              {allRTUs.length === 0 ? (
                <div className="text-sm text-gray-500 py-2">
                  {loading ? "연결 중..." : "데이터가 없습니다."}
                </div>
              ) : (
                allRTUs.map((rtuId) => {
                  const rtu = rtuData.get(rtuId);
                  return (
                    <div
                      key={rtuId}
                      className={`p-2 rounded cursor-pointer border ${
                        selectedRTUs.has(rtuId)
                          ? "bg-blue-100 border-blue-400"
                          : "bg-white border-gray-200"
                      }`}
                      onClick={() => toggleRTUSelection(rtuId)}
                    >
                      <div className="flex items-center justify-between">
                        <span>{rtu?.name || `RTU-${rtuId}`}</span>
                        {rtu && getStatusBadge(rtu.status)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <main className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {selectedRTUs.size === 0 ? (
              <div className="col-span-full p-8 text-center bg-white rounded-lg border border-gray-200 text-gray-500">
                좌측 목록에서 모니터링할 RTU를 선택하세요.
              </div>
            ) : (
              Array.from(selectedRTUs).map((rtuId) => {
                const rtu = rtuData.get(rtuId);
                if (!rtu) return null;

                return (
                  <Card key={rtuId} className="shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between mb-1">
                        <CardTitle className="text-lg">{rtu.name}</CardTitle>
                        {getStatusBadge(rtu.status)}
                      </div>
                      <div className="text-xs text-gray-500">ID: {rtu.id}</div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-2">
                      {/* 배터리 및 신호 강도 섹션 */}
                      <div className="space-y-3">
                        {/* 배터리 Progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">배터리</span>
                            <span
                              className={`text-xs ${getBatteryColor(
                                rtu.battery
                              )}`}
                            >
                              {rtu.battery}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getBatteryColor(
                                rtu.battery,
                                true
                              )}`}
                              style={{ width: `${rtu.battery}%` }}
                            />
                          </div>
                        </div>

                        {/* 신호 강도 Progress */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              신호 강도
                            </span>
                            <span
                              className={`text-xs ${getSignalColor(
                                rtu.signal
                              )}`}
                            >
                              {rtu.signal}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getSignalColor(
                                rtu.signal,
                                true
                              )}`}
                              style={{ width: `${rtu.signal}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 차트 탭 - Progress 아래로 이동 */}
                      <div className="pt-2 border-t">
                        <Tabs defaultValue="battery" className="w-full">
                          <TabsList className="w-full grid grid-cols-3 h-9">
                            <TabsTrigger value="battery" className="text-xs">
                              배터리
                            </TabsTrigger>
                            <TabsTrigger value="signal" className="text-xs">
                              신호
                            </TabsTrigger>
                            <TabsTrigger value="values" className="text-xs">
                              측정값
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent
                            value="battery"
                            className="h-[200px] mt-2 p-0"
                          >
                            <RTUBatteryChart rtuId={rtu.id} />
                          </TabsContent>
                          <TabsContent
                            value="signal"
                            className="h-[200px] mt-2 p-0"
                          >
                            <RTUSignalChart rtuId={rtu.id} />
                          </TabsContent>
                          <TabsContent
                            value="values"
                            className="h-[200px] mt-2 p-0"
                          >
                            <RTUValuesBarChart rtuId={rtu.id} />
                          </TabsContent>
                        </Tabs>
                      </div>

                      <div className="text-xs text-gray-500 pt-1">
                        마지막 업데이트:{" "}
                        {new Date(rtu.lastUpdate).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
