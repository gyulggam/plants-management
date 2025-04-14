import { faker } from "@faker-js/faker/locale/ko";
import { PowerPlant } from "@/types/power-plant";

// 발전소 유형 목록
const plantTypes = ["태양광", "풍력", "수력", "바이오매스", "지열"];

// 설치 유형 목록
const installTypes = ["육상", "수상", "건물형", "영농형", null];

// 모듈 유형 목록
const moduleTypes = ["단결정", "다결정", "박막형", "PERC", "TOPCON", null];

// 계약 유형 목록
const contractTypes = [
  "현물고객",
  "선도계약",
  "대체에너지",
  "민간PPA",
  "신규사업",
];

// 계약 날짜 목록
const contractDates = [
  "1차 (24-06)",
  "2차 (24-07)",
  "3차 (24-08)",
  "4차 (24-09)",
  "1차 (25-01)",
];

// 발전소 이름 제작용 접두사와 접미사
const namePrefixes = [
  "해",
  "태양",
  "바람",
  "푸른",
  "녹색",
  "맑은",
  "미래",
  "신재생",
  "에코",
  "그린",
];
const nameSuffixes = [
  "에너지",
  "파워",
  "발전소",
  "그린",
  "솔라",
  "빛",
  "인더스트리",
  "플렉스",
  "하우스",
  "팜",
];

/**
 * 단일 발전소 데이터 생성
 */
export function generatePlant(id: number): PowerPlant {
  // 발전소 유형 결정
  const type = faker.helpers.arrayElement(plantTypes);

  // 발전소 상태 결정 (70%는 정상)
  const status = faker.helpers.arrayElement(
    faker.datatype.boolean(0.7)
      ? ["정상", "가동중"]
      : ["점검중", "수리중", "고장", "중지"]
  );

  // 용량 결정 (유형에 따라 다른 범위 사용)
  const capacity =
    type === "태양광"
      ? faker.number.int({ min: 500, max: 5000 })
      : type === "풍력"
      ? faker.number.int({ min: 2000, max: 8000 })
      : faker.number.int({ min: 1000, max: 3000 });

  // 위도/경도 결정 (대한민국 기준)
  const latitude = faker.location.latitude({ min: 33, max: 38 });
  const longitude = faker.location.longitude({ min: 125, max: 130 });

  // 발전소 이름 생성
  const name = `${faker.helpers.arrayElement(
    namePrefixes
  )}${faker.helpers.arrayElement(nameSuffixes)}`;

  // 계약 정보
  const contractType = faker.helpers.arrayElement(contractTypes);
  const contractDate = faker.helpers.arrayElement(contractDates);
  const weight = faker.number.float({ min: 1.0, max: 1.2, fractionDigits: 3 });

  // 설치 날짜 (일부는 null)
  const installDate = faker.datatype.boolean(0.7)
    ? faker.date.past({ years: 5 }).toISOString().split("T")[0]
    : null;

  // RTU ID 생성
  const rtuId = faker.string.numeric(4);

  return {
    id,
    modified_at: faker.date.future().toISOString(),
    status,
    infra: {
      id: id,
      carrier_fk: 10000 + id,
      name,
      type,
      address: faker.location.streetAddress({ useFullAddress: true }),
      latitude,
      longitude,
      altitude: faker.datatype.boolean(0.6)
        ? faker.number.int({ min: 0, max: 1000 })
        : null,
      capacity,
      install_date: installDate,
      kpx_identifier: {
        id: id,
        kpx_cbp_gen_id: faker.string.numeric(4),
      },
      inverter: [
        {
          id: id,
          capacity: capacity,
          tilt: faker.number.int({ min: 0, max: 45 }),
          azimuth: faker.number.int({ min: 90, max: 270 }),
          install_type: faker.helpers.arrayElement(installTypes),
          module_type: faker.helpers.arrayElement(moduleTypes),
        },
      ],
      ess: [],
    },
    monitoring: {
      id: 200 + id,
      company: faker.number.int({ min: 1, max: 5 }),
      rtu_id: rtuId,
      resource: id,
    },
    control: [
      {
        id: 50 + id,
        company: faker.number.int({ min: 1, max: 5 }),
        control_type: faker.number.int({ min: 1, max: 3 }),
        controllable_capacity: capacity,
        rtu_id: rtuId,
        onoff_inverter_capacity: {},
        priority: faker.number.int({ min: 1, max: 5 }),
        resource: id,
      },
    ],
    contract: {
      id: id,
      modified_at: faker.date.recent().toISOString(),
      resource: id,
      contract_type: contractType,
      contract_date: contractDate,
      weight,
      fixed_contract_type: faker.datatype.boolean(0.3) ? "고정가격" : null,
      fixed_contract_price: faker.datatype.boolean(0.3)
        ? faker.number.int({ min: 100, max: 200 })
        : null,
      fixed_contract_agreement_date: faker.datatype.boolean(0.3)
        ? faker.date.past().toISOString()
        : null,
    },
    substation: faker.number.int({ min: 1, max: 20 }),
    dl: faker.number.int({ min: 20, max: 50 }),
    fixed_contract_price: faker.datatype.boolean(0.3)
      ? faker.number.int({ min: 100, max: 200 })
      : null,
    guaranteed_capacity:
      -1 * faker.number.float({ min: 10000, max: 30000, fractionDigits: 3 }),
  };
}

/**
 * 여러 발전소 데이터 생성
 */
export function generatePlants(count: number): PowerPlant[] {
  return Array.from({ length: count }, (_, index) => generatePlant(index + 1));
}

/**
 * 기본 데이터 생성 (30개)
 */
export const fakePlants = generatePlants(30);
