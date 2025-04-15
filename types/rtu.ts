export interface RTU {
  id: string;
  name: string;
  type: string;
  model: string;
  manufacturer: string;
  firmware_version: string;
  serial_number: string;
  installation_date: string;
  last_maintenance_date: string | null;
  communication_protocol: string;
  ip_address: string | null;
  port: number | null;
  status: "active" | "inactive" | "maintenance" | "error";
  plant_id: number | null;
  plant_name: string | null;
  location: string;
  description: string | null;
  last_connection: string | null;
  data_interval: number; // 초 단위
  battery_level: number | null; // 백분율
  signal_strength: number | null; // dBm
  notes: string | null;
}

export interface RTUStatus {
  id: string;
  timestamp: string;
  status: "online" | "offline" | "warning" | "error";
  battery_level: number | null;
  signal_strength: number | null;
  data_sent: number;
  data_received: number;
  errors: RTUError[];
  response_time: number; // ms
}

export interface RTUError {
  code: string;
  message: string;
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  resolved: boolean;
  resolved_at: string | null;
}

export interface RTUData {
  id: string;
  name: string;
  battery: number;
  signal: number;
  status: "online" | "offline" | "warning";
  lastUpdate: string;
}

export interface RTUCommand {
  id: string;
  rtu_id: string;
  command: string;
  parameters: Record<string, unknown>;
  issued_at: string;
  issued_by: string;
  status: "pending" | "sent" | "received" | "executed" | "failed";
  response: string | null;
  completed_at: string | null;
}

export type RTUCommunicationProtocol =
  | "Modbus"
  | "DNP3"
  | "IEC 61850"
  | "MQTT"
  | "HTTP/REST"
  | "LoRaWAN"
  | "Zigbee"
  | "Custom";

// 서버 API 응답 타입
export interface APIResponseRTUData {
  id: string;
  timestamp: string;
  status: "online" | "offline" | "warning" | "error";
  batteryLevel: number | null;
  signalStrength: number | null;
  values: Record<string, number | string | boolean | null>;
}

// 차트에 표시할 데이터 형식
export interface ChartData {
  timestamp: string;
  battery?: number;
  signal?: number;
  time: string;
  [key: string]: string | number | undefined;
}

// 막대 차트에 표시할 측정값 데이터 형식
export interface MeasurementData {
  name: string;
  value: number;
}
