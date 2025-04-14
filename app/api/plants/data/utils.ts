import { PowerPlant } from "@/types/power-plant";
import { fakePlants, generatePlant } from "./fake-generator";

/**
 * 특정 유형의 발전소 필터링
 */
export function filterPlantsByType(type: string): PowerPlant[] {
  return fakePlants.filter((plant) => plant.infra.type === type);
}

/**
 * 발전소 ID로 조회
 */
export function getPlantById(id: number): PowerPlant | undefined {
  return fakePlants.find((plant) => plant.id === id);
}

/**
 * 용량으로 발전소 필터링
 */
export function filterPlantsByCapacity(min: number, max: number): PowerPlant[] {
  return fakePlants.filter(
    (plant) => plant.infra.capacity >= min && plant.infra.capacity <= max
  );
}

/**
 * 계약 유형으로 발전소 필터링
 */
export function filterPlantsByContractType(contractType: string): PowerPlant[] {
  return fakePlants.filter(
    (plant) => plant.contract.contract_type === contractType
  );
}

/**
 * 발전소 타입 집계 (유형별 개수 및 용량)
 */
export function aggregateByType(): Array<{
  type: string;
  count: number;
  totalCapacity: number;
}> {
  const types = new Map<string, { count: number; totalCapacity: number }>();

  fakePlants.forEach((plant) => {
    const type = plant.infra.type;
    const existing = types.get(type) || { count: 0, totalCapacity: 0 };

    types.set(type, {
      count: existing.count + 1,
      totalCapacity: existing.totalCapacity + plant.infra.capacity,
    });
  });

  return Array.from(types.entries()).map(([type, data]) => ({
    type,
    count: data.count,
    totalCapacity: data.totalCapacity,
  }));
}

/**
 * 발전소 추가 (개발용)
 */
export function addPlant(): PowerPlant {
  const newId = Math.max(...fakePlants.map((p) => p.id)) + 1;
  const newPlant = generatePlant(newId);
  fakePlants.push(newPlant);
  return newPlant;
}

/**
 * 발전소 수정 (개발용)
 */
export function updatePlant(
  id: number,
  updates: Partial<PowerPlant>
): PowerPlant | null {
  const index = fakePlants.findIndex((p) => p.id === id);
  if (index === -1) return null;

  fakePlants[index] = { ...fakePlants[index], ...updates };
  return fakePlants[index];
}

/**
 * 발전소 삭제 (개발용)
 */
export function deletePlant(id: number): boolean {
  const index = fakePlants.findIndex((p) => p.id === id);
  if (index === -1) return false;

  fakePlants.splice(index, 1);
  return true;
}
