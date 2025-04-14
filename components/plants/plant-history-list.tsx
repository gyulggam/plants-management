"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface PlantHistory {
  id: string;
  plantId: string;
  type: string;
  changes: {
    field: string;
    oldValue: string | number | boolean | null | undefined;
    newValue: string | number | boolean | null | undefined;
  }[];
  changedBy: string;
  changedAt: string;
  description?: string;
  plant: {
    name: string;
  };
}

export function PlantHistoryList() {
  const [histories, setHistories] = useState<PlantHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistories();
  }, []);

  const fetchHistories = async () => {
    try {
      const response = await fetch("/api/plants/history");
      const data = await response.json();
      setHistories(data);
    } catch (error) {
      console.error("변경 이력 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "CREATE":
        return "생성";
      case "UPDATE":
        return "수정";
      case "DELETE":
        return "삭제";
      default:
        return type;
    }
  };

  const getChangeDescription = (changes: PlantHistory["changes"]) => {
    if (!changes || changes.length === 0) return "변경 내용 없음";

    return changes
      .map((change) => {
        const fieldNames: { [key: string]: string } = {
          name: "발전소명",
          type: "유형",
          capacity: "용량",
          location: "위치",
          latitude: "위도",
          longitude: "경도",
          status: "상태",
        };

        const fieldName = fieldNames[change.field] || change.field;
        return `${fieldName}: ${change.oldValue} → ${change.newValue}`;
      })
      .join(", ");
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>발전소</TableHead>
            <TableHead>변경 유형</TableHead>
            <TableHead>변경 내용</TableHead>
            <TableHead>변경자</TableHead>
            <TableHead>변경 일시</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {histories.map((history) => (
            <TableRow key={history.id}>
              <TableCell>{history.plant.name}</TableCell>
              <TableCell>{getTypeLabel(history.type)}</TableCell>
              <TableCell>
                {history.description || getChangeDescription(history.changes)}
              </TableCell>
              <TableCell>{history.changedBy}</TableCell>
              <TableCell>
                {format(new Date(history.changedAt), "yyyy-MM-dd HH:mm:ss", {
                  locale: ko,
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
