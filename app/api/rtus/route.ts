import { NextRequest, NextResponse } from "next/server";
import { fakeRTUs } from "./data/fake-generator";
import { RTU } from "@/types/rtu";
import { v4 as uuidv4 } from "uuid";

// GET /api/rtus - 모든 RTU 목록 가져오기
export async function GET(request: NextRequest) {
  try {
    // URL 파라미터에서 필터링 정보 추출
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const manufacturer = searchParams.get("manufacturer");
    const protocol = searchParams.get("protocol");
    const plantId = searchParams.get("plant_id");

    // 필터링 적용
    let filteredRTUs = [...fakeRTUs];

    if (status) {
      filteredRTUs = filteredRTUs.filter((rtu) => rtu.status === status);
    }

    if (manufacturer) {
      filteredRTUs = filteredRTUs.filter((rtu) =>
        rtu.manufacturer.toLowerCase().includes(manufacturer.toLowerCase())
      );
    }

    if (protocol) {
      filteredRTUs = filteredRTUs.filter((rtu) =>
        rtu.communication_protocol
          .toLowerCase()
          .includes(protocol.toLowerCase())
      );
    }

    if (plantId) {
      const plantIdNum = parseInt(plantId);
      if (!isNaN(plantIdNum)) {
        filteredRTUs = filteredRTUs.filter(
          (rtu) => rtu.plant_id === plantIdNum
        );
      }
    }

    // 페이지네이션 처리
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedRTUs = filteredRTUs.slice(startIndex, endIndex);
    const totalRTUs = filteredRTUs.length;
    const totalPages = Math.ceil(totalRTUs / limit);

    return NextResponse.json({
      status: "success",
      data: paginatedRTUs,
      meta: {
        total: totalRTUs,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("GET /api/rtus error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "RTU 목록을 가져오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// POST /api/rtus - 새 RTU 등록
export async function POST(request: NextRequest) {
  try {
    // 요청 바디 파싱
    const body = await request.json();

    // 필수 필드 검증
    if (!body.name || !body.model || !body.manufacturer) {
      return NextResponse.json(
        {
          status: "error",
          message: "RTU 이름, 모델, 제조사는 필수 입력 항목입니다.",
        },
        { status: 400 }
      );
    }

    // 신규 ID 생성
    const newId = uuidv4().substring(0, 8);

    // 신규 RTU 생성
    const newRTU: RTU = {
      id: newId,
      name: body.name,
      type: body.type || "발전량 모니터링",
      model: body.model,
      manufacturer: body.manufacturer,
      firmware_version: body.firmware_version || "v1.0.0",
      serial_number: body.serial_number || newId.toUpperCase(),
      installation_date:
        body.installation_date || new Date().toISOString().split("T")[0],
      last_maintenance_date: body.last_maintenance_date || null,
      communication_protocol: body.communication_protocol || "Modbus",
      ip_address: body.ip_address || null,
      port: body.port || null,
      status: body.status || "active",
      plant_id: body.plant_id || null,
      plant_name: body.plant_name || null,
      location: body.location || "",
      description: body.description || null,
      last_connection: body.last_connection || new Date().toISOString(),
      data_interval: body.data_interval || 60,
      battery_level: body.battery_level || null,
      signal_strength: body.signal_strength || null,
      notes: body.notes || null,
    };

    // RTU 데이터 추가
    fakeRTUs.push(newRTU);

    return NextResponse.json({
      status: "success",
      data: newRTU,
    });
  } catch (error) {
    console.error("POST /api/rtus error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "RTU를 등록하는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
