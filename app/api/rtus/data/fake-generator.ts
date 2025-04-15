import { faker } from "@faker-js/faker";
import { RTU, RTUCommunicationProtocol } from "@/types/rtu";
import { fakePlants } from "../../plants/data/fake-generator";

// RTU 제조사 목록
const manufacturers = [
  "Siemens",
  "ABB",
  "Schneider Electric",
  "General Electric",
  "Honeywell",
  "Emerson",
  "Yokogawa",
  "Rockwell Automation",
  "Mitsubishi Electric",
  "Phoenix Contact",
];

// RTU 모델 접두사
const modelPrefixes = ["RTU", "REM", "CTRL", "XTR", "SYS", "MON"];

// RTU 모델 접미사
const modelSuffixes = ["1000", "2000", "3000", "PRO", "LITE", "MAX", "PLUS"];

// RTU 타입
const rtuTypes = [
  "발전량 모니터링",
  "환경 센서",
  "통합 제어",
  "전력 품질",
  "보안 모니터링",
];

// 통신 프로토콜
const protocols: RTUCommunicationProtocol[] = [
  "Modbus",
  "DNP3",
  "IEC 61850",
  "MQTT",
  "HTTP/REST",
  "LoRaWAN",
  "Zigbee",
  "Custom",
];

// 가짜 RTU 데이터 배열
export const fakeRTUs: RTU[] = [];

// 가짜 RTU 데이터 생성
export function generateRTU(id: string): RTU {
  // 제조사 선택
  const manufacturer = faker.helpers.arrayElement(manufacturers);

  // 모델명 생성
  const model = `${faker.helpers.arrayElement(
    modelPrefixes
  )}-${faker.helpers.arrayElement(modelSuffixes)}`;

  // 타입 선택
  const type = faker.helpers.arrayElement(rtuTypes);

  // 통신 프로토콜 선택
  const protocol = faker.helpers.arrayElement(protocols);

  // 랜덤하게 발전소와 연결 (30%는 연결되지 않음)
  const linkedToPlant = faker.datatype.boolean(0.7);
  const plant = linkedToPlant ? faker.helpers.arrayElement(fakePlants) : null;

  // 설치 날짜
  const installationDate = faker.date
    .past({ years: 5 })
    .toISOString()
    .split("T")[0];

  // 마지막 유지보수 날짜 (일부는 null)
  const lastMaintenanceDate = faker.datatype.boolean(0.8)
    ? faker.date.past({ years: 1 }).toISOString().split("T")[0]
    : null;

  // 상태 결정 (70%는 active)
  const status = faker.helpers.arrayElement(
    faker.datatype.boolean(0.7)
      ? ["active"]
      : ["inactive", "maintenance", "error"]
  ) as RTU["status"];

  // IP 주소 (일부는 null)
  const ipAddress = faker.datatype.boolean(0.8) ? faker.internet.ipv4() : null;

  // 포트 (일부는 null)
  const port = ipAddress ? faker.number.int({ min: 1024, max: 65535 }) : null;

  // 마지막 연결 시간 (일부는 null)
  const lastConnection =
    status === "active"
      ? faker.date.recent().toISOString()
      : status === "inactive"
      ? faker.date.past({ years: 0.08 }).toISOString()
      : faker.datatype.boolean(0.5)
      ? faker.date.past({ years: 0.03 }).toISOString()
      : null;

  // 배터리 레벨 (일부는 null)
  const batteryLevel = faker.datatype.boolean(0.7)
    ? faker.number.int({ min: 5, max: 100 })
    : null;

  // 신호 강도 (일부는 null)
  const signalStrength = faker.datatype.boolean(0.7)
    ? faker.number.int({ min: -120, max: -30 })
    : null;

  return {
    id,
    name: `${plant ? plant.infra.name : faker.location.city()} RTU-${id}`,
    type,
    model,
    manufacturer,
    firmware_version: `v${faker.system.semver()}`,
    serial_number: faker.string.alphanumeric(10).toUpperCase(),
    installation_date: installationDate,
    last_maintenance_date: lastMaintenanceDate,
    communication_protocol: protocol,
    ip_address: ipAddress,
    port,
    status,
    plant_id: plant ? plant.id : null,
    plant_name: plant ? plant.infra.name : null,
    location: plant
      ? plant.infra.address
      : faker.location.streetAddress({ useFullAddress: true }),
    description: faker.datatype.boolean(0.7) ? faker.lorem.sentence() : null,
    last_connection: lastConnection,
    data_interval: faker.helpers.arrayElement([5, 10, 15, 30, 60, 300, 600]),
    battery_level: batteryLevel,
    signal_strength: signalStrength,
    notes: faker.datatype.boolean(0.3) ? faker.lorem.paragraph() : null,
  };
}

// 초기 가짜 데이터 생성
export function generateInitialFakeRTUs(count: number = 100): void {
  for (let i = 1; i <= count; i++) {
    const id = i.toString().padStart(4, "0");
    fakeRTUs.push(generateRTU(id));
  }
}

// 초기 데이터 생성
generateInitialFakeRTUs();

// RTU ID로 RTU 찾기
export function getRTUById(id: string): RTU | undefined {
  return fakeRTUs.find((rtu) => rtu.id === id);
}

// 발전소 ID로 연결된 RTU 찾기
export function getRTUsByPlantId(plantId: number): RTU[] {
  return fakeRTUs.filter((rtu) => rtu.plant_id === plantId);
}

// 상태별 RTU 찾기
export function getRTUsByStatus(status: RTU["status"]): RTU[] {
  return fakeRTUs.filter((rtu) => rtu.status === status);
}

// 제조사별 RTU 찾기
export function getRTUsByManufacturer(manufacturer: string): RTU[] {
  return fakeRTUs.filter((rtu) => rtu.manufacturer === manufacturer);
}

// 통신 프로토콜별 RTU 찾기
export function getRTUsByProtocol(protocol: string): RTU[] {
  return fakeRTUs.filter((rtu) => rtu.communication_protocol === protocol);
}
