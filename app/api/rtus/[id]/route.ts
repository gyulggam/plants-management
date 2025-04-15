import { NextRequest, NextResponse } from "next/server";
import { fakeRTUs, getRTUById } from "../data/fake-generator";
import { RTU } from "@/types/rtu";

// GET /api/rtus/[id] - 특정 RTU 조회
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const rtu = getRTUById(id);

    if (!rtu) {
      return NextResponse.json(
        {
          status: "error",
          message: `ID: ${id}에 해당하는 RTU를 찾을 수 없습니다.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: rtu,
    });
  } catch (error) {
    console.error(`Error fetching RTU with ID ${params.id}:`, error);
    return NextResponse.json(
      {
        status: "error",
        message: "RTU 정보를 가져오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/rtus/[id] - RTU 정보 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const rtuIndex = fakeRTUs.findIndex((r) => r.id === id);

    if (rtuIndex === -1) {
      return NextResponse.json(
        {
          status: "error",
          message: `ID: ${id}에 해당하는 RTU를 찾을 수 없습니다.`,
        },
        { status: 404 }
      );
    }

    // 업데이트할 데이터 파싱
    const updateData = await request.json();

    // 기존 RTU 정보
    const existingRTU = fakeRTUs[rtuIndex];

    // 변경된 정보 적용
    const updatedRTU: RTU = {
      ...existingRTU,
      name: updateData.name || existingRTU.name,
      type: updateData.type || existingRTU.type,
      model: updateData.model || existingRTU.model,
      manufacturer: updateData.manufacturer || existingRTU.manufacturer,
      firmware_version:
        updateData.firmware_version || existingRTU.firmware_version,
      serial_number: updateData.serial_number || existingRTU.serial_number,
      last_maintenance_date:
        updateData.last_maintenance_date !== undefined
          ? updateData.last_maintenance_date
          : existingRTU.last_maintenance_date,
      communication_protocol:
        updateData.communication_protocol || existingRTU.communication_protocol,
      ip_address:
        updateData.ip_address !== undefined
          ? updateData.ip_address
          : existingRTU.ip_address,
      port: updateData.port !== undefined ? updateData.port : existingRTU.port,
      status: updateData.status || existingRTU.status,
      plant_id:
        updateData.plant_id !== undefined
          ? updateData.plant_id
          : existingRTU.plant_id,
      plant_name:
        updateData.plant_name !== undefined
          ? updateData.plant_name
          : existingRTU.plant_name,
      location: updateData.location || existingRTU.location,
      description:
        updateData.description !== undefined
          ? updateData.description
          : existingRTU.description,
      last_connection:
        updateData.last_connection || existingRTU.last_connection,
      data_interval: updateData.data_interval || existingRTU.data_interval,
      battery_level:
        updateData.battery_level !== undefined
          ? updateData.battery_level
          : existingRTU.battery_level,
      signal_strength:
        updateData.signal_strength !== undefined
          ? updateData.signal_strength
          : existingRTU.signal_strength,
      notes:
        updateData.notes !== undefined ? updateData.notes : existingRTU.notes,
    };

    // RTU 정보 업데이트
    fakeRTUs[rtuIndex] = updatedRTU;

    return NextResponse.json({
      status: "success",
      data: updatedRTU,
    });
  } catch (error) {
    console.error(`Error updating RTU with ID ${params.id}:`, error);
    return NextResponse.json(
      {
        status: "error",
        message: "RTU 정보를 수정하는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/rtus/[id] - RTU 삭제
export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const rtuIndex = fakeRTUs.findIndex((r) => r.id === id);

    if (rtuIndex === -1) {
      return NextResponse.json(
        {
          status: "error",
          message: `ID: ${id}에 해당하는 RTU를 찾을 수 없습니다.`,
        },
        { status: 404 }
      );
    }

    // RTU 삭제
    fakeRTUs.splice(rtuIndex, 1);

    return NextResponse.json({
      status: "success",
      message: `ID: ${id} RTU가 성공적으로 삭제되었습니다.`,
    });
  } catch (error) {
    console.error(`Error deleting RTU with ID ${params.id}:`, error);
    return NextResponse.json(
      {
        status: "error",
        message: "RTU를 삭제하는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
