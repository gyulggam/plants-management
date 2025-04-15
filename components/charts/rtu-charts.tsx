"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { useState, useEffect } from "react";

// 공통 설정값
const CHART_WIDTH = 500;
const CHART_HEIGHT = 180;
const UPDATE_INTERVAL = 5000;

interface RTUChartProps {
  rtuId: string;
}

// 차트에 표시할 데이터 형식
interface ChartData {
  timestamp: string;
  battery?: number;
  signal?: number;
  time: string;
}

// 막대 차트에 표시할 측정값 데이터 형식
interface MeasurementData {
  name: string;
  value: number;
}

export function RTUBatteryChart({ rtuId }: RTUChartProps) {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // RTU 데이터 히스토리 가져오기 및 주기적 갱신
  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        // 초기 더미 데이터 설정
        const now = new Date();
        const dummyData: ChartData[] = [];

        // 24시간 데이터 생성 (2시간 간격)
        for (let i = 0; i < 12; i++) {
          const timestamp = new Date(
            now.getTime() - (11 - i) * 2 * 60 * 60 * 1000
          );
          dummyData.push({
            timestamp: timestamp.toISOString(),
            battery: 50 + Math.random() * 40 - (i > 6 ? 0 : 10), // 배터리는 시간이 지날수록 감소
            signal: 60 + Math.random() * 30,
            time: `${timestamp.getHours()}:00`,
          });
        }

        setData(dummyData);
        setIsLoading(false);
      } catch (error) {
        console.error("차트 데이터 로드 오류:", error);
        setIsLoading(false);
      }
    };

    // 초기 데이터 로드
    fetchHistoryData();

    // 주기적으로 데이터 자동 갱신
    const intervalId = setInterval(() => {
      fetchHistoryData();
    }, UPDATE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [rtuId]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse bg-gray-200 h-full w-full rounded-md" />
      </div>
    );
  }

  // 데이터가 비어있는지 확인
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-gray-500">
        데이터가 없습니다
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <AreaChart
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        data={data}
        margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="time" tick={{ fontSize: 9 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            fontSize: "10px",
          }}
          formatter={(value: number) => [`${value}%`, "배터리"]}
        />
        <Area
          type="monotone"
          dataKey="battery"
          stroke="#2563eb"
          fill="#3b82f6"
          fillOpacity={0.5}
        />
      </AreaChart>
    </div>
  );
}

export function RTUSignalChart({ rtuId }: RTUChartProps) {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // RTU 데이터 히스토리 가져오기 및 주기적 갱신
  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        // 초기 더미 데이터 설정
        const now = new Date();
        const dummyData: ChartData[] = [];

        // 24시간 데이터 생성 (2시간 간격)
        for (let i = 0; i < 12; i++) {
          const timestamp = new Date(
            now.getTime() - (11 - i) * 2 * 60 * 60 * 1000
          );
          const hour = timestamp.getHours();

          // 야간(22-06시)에는 신호 강도 약화 시뮬레이션
          const timeOfDayFactor = hour >= 22 || hour <= 6 ? 0.8 : 1;

          dummyData.push({
            timestamp: timestamp.toISOString(),
            signal: Math.round((60 + Math.random() * 35) * timeOfDayFactor),
            time: `${hour}:00`,
          });
        }

        setData(dummyData);
        setIsLoading(false);
      } catch (error) {
        console.error("차트 데이터 로드 오류:", error);
        setIsLoading(false);
      }
    };

    // 초기 데이터 로드
    fetchHistoryData();

    // 주기적으로 데이터 자동 갱신
    const intervalId = setInterval(() => {
      fetchHistoryData();
    }, UPDATE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [rtuId]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse bg-gray-200 h-full w-full rounded-md" />
      </div>
    );
  }

  // 데이터가 비어있는지 확인
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-gray-500">
        데이터가 없습니다
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <LineChart
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        data={data}
        margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="time" tick={{ fontSize: 9 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            fontSize: "10px",
          }}
          formatter={(value: number) => [`${value}%`, "신호 강도"]}
        />
        <Line
          type="monotone"
          dataKey="signal"
          stroke="#16a34a"
          strokeWidth={1.5}
          dot={{ r: 2 }}
        />
      </LineChart>
    </div>
  );
}

export function RTUValuesBarChart({ rtuId }: RTUChartProps) {
  const [data, setData] = useState<MeasurementData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // RTU 데이터 가져오기 및 주기적 갱신
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 초기 더미 데이터 설정
        const dummyData: MeasurementData[] = [
          { name: "온도", value: Math.round(20 + Math.random() * 15) },
          { name: "습도", value: Math.round(50 + Math.random() * 40) },
          { name: "전력", value: Math.round(400 + Math.random() * 300) },
          { name: "전압", value: Math.round(220 + Math.random() * 10) },
          { name: "전류", value: Math.round(10 + Math.random() * 5) },
        ];

        setData(dummyData);
        setIsLoading(false);
      } catch (error) {
        console.error("차트 데이터 로드 오류:", error);
        setIsLoading(false);
      }
    };

    // 초기 데이터 로드
    fetchData();

    // 주기적으로 데이터 자동 갱신
    const intervalId = setInterval(() => {
      fetchData();
    }, UPDATE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [rtuId]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse bg-gray-200 h-full w-full rounded-md" />
      </div>
    );
  }

  // 데이터가 비어있는지 확인
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs text-gray-500">
        데이터가 없습니다
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <BarChart
        layout="vertical"
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        data={data}
        margin={{ top: 5, right: 5, left: 45, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#f0f0f0"
          horizontal={true}
          vertical={false}
        />
        <XAxis type="number" tick={{ fontSize: 9 }} />
        <YAxis
          dataKey="name"
          type="category"
          tick={{ fontSize: 9 }}
          width={40}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            fontSize: "10px",
          }}
        />
        <Bar
          dataKey="value"
          fill="#3b82f6"
          barSize={10}
          radius={[0, 3, 3, 0]}
        />
      </BarChart>
    </div>
  );
}
