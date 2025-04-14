import { NextRequest, NextResponse } from "next/server";
import { fakePlants } from "./data/fake-generator";
import { PowerPlant } from "@/types/power-plant";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const HISTORY_DIR = path.join(process.cwd(), "data", "history");

// 변경 이력 파일이 없으면 생성
if (!fs.existsSync(HISTORY_DIR)) {
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
}

// GET /api/plants
export async function GET() {
  try {
    // 모든 발전소 데이터 반환
    return NextResponse.json({
      status: "success",
      data: fakePlants,
    });
  } catch (error) {
    console.error("GET /api/plants error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "발전소 목록을 가져오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// POST /api/plants - 새 발전소 생성
export async function POST(request: NextRequest) {
  try {
    // 요청 바디 파싱
    const body = await request.json();

    // 필수 필드 검증
    if (!body.infra || !body.infra.name || !body.infra.type) {
      return NextResponse.json(
        {
          status: "error",
          message: "발전소 이름과 유형은 필수 입력 항목입니다.",
        },
        { status: 400 }
      );
    }

    // 새 ID 생성 (실제로는 DB에서 자동 생성 될 것)
    const newId =
      fakePlants.length > 0 ? Math.max(...fakePlants.map((p) => p.id)) + 1 : 1;

    // infra.id 설정
    const infraId = newId;

    // 새 발전소 생성
    const newPlant: PowerPlant = {
      id: newId,
      modified_at: new Date().toISOString(),
      status: body.status || "정상",
      infra: {
        id: infraId,
        carrier_fk: body.infra.carrier_fk || 10000 + infraId,
        name: body.infra.name,
        type: body.infra.type,
        address: body.infra.address || "",
        latitude: body.infra.latitude || 36.5,
        longitude: body.infra.longitude || 127.5,
        altitude: body.infra.altitude || null,
        capacity: body.infra.capacity || 1000,
        install_date: body.infra.install_date || null,
        kpx_identifier: {
          id: infraId,
          kpx_cbp_gen_id: body.infra.kpx_identifier?.kpx_cbp_gen_id || "",
        },
        inverter: [
          {
            id: infraId,
            capacity: body.infra.capacity || 1000,
            tilt: body.infra.inverter?.[0]?.tilt || 0,
            azimuth: body.infra.inverter?.[0]?.azimuth || 180,
            install_type: body.infra.inverter?.[0]?.install_type || null,
            module_type: body.infra.inverter?.[0]?.module_type || null,
          },
        ],
        ess: [],
      },
      monitoring: {
        id: 200 + newId,
        company: body.monitoring?.company || 1,
        rtu_id: body.monitoring?.rtu_id || "",
        resource: newId,
      },
      control: [
        {
          id: 50 + newId,
          company: body.control?.[0]?.company || 1,
          control_type: body.control?.[0]?.control_type || 1,
          controllable_capacity: body.infra.capacity || 1000,
          rtu_id: body.monitoring?.rtu_id || "",
          onoff_inverter_capacity: {},
          priority: body.control?.[0]?.priority || 1,
          resource: newId,
        },
      ],
      contract: {
        id: newId,
        modified_at: new Date().toISOString(),
        resource: newId,
        contract_type: body.contract?.contract_type || "일반",
        contract_date: body.contract?.contract_date || "",
        weight: body.contract?.weight || 1.0,
        fixed_contract_type: body.contract?.fixed_contract_type || null,
        fixed_contract_price: body.contract?.fixed_contract_price || null,
        fixed_contract_agreement_date:
          body.contract?.fixed_contract_agreement_date || null,
      },
      substation: body.substation || 1,
      dl: body.dl || 1,
      fixed_contract_price: body.fixed_contract_price || null,
      guaranteed_capacity: body.guaranteed_capacity || 0,
    };

    // 실제 API에서는 여기서 DB에 저장
    // 여기서는 메모리에 있는 fakePlants 배열에 추가
    fakePlants.push(newPlant);

    // 추가 이력 생성
    const historyData = {
      id: uuidv4(),
      plantId: newId.toString(),
      type: "create",
      changes: {
        before: null,
        after: newPlant,
      },
      changedBy: "system", // TODO: 실제 사용자 정보로 변경
      changedAt: new Date().toISOString(),
    };

    // 변경 이력 저장
    fs.writeFileSync(
      path.join(HISTORY_DIR, `${historyData.id}.json`),
      JSON.stringify(historyData, null, 2)
    );

    return NextResponse.json({
      status: "success",
      data: newPlant,
    });
  } catch (error) {
    console.error("POST /api/plants error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "발전소를 등록하는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
