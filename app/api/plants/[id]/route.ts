import { NextRequest, NextResponse } from "next/server";
import { fakePlants } from "../data/fake-generator";
import { getPlantById } from "../data/utils";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const HISTORY_DIR = path.join(process.cwd(), "data", "history");

// 변경 이력 파일이 없으면 생성
if (!fs.existsSync(HISTORY_DIR)) {
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
}

// GET /api/plants/[id] - 발전소 상세 정보 조회
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          status: "error",
          message: "유효하지 않은 발전소 ID입니다.",
        },
        { status: 400 }
      );
    }

    const plant = getPlantById(id);

    if (!plant) {
      return NextResponse.json(
        {
          status: "error",
          message: `ID: ${id}에 해당하는 발전소를 찾을 수 없습니다.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      data: plant,
    });
  } catch (error) {
    console.error(`Error fetching plant with ID ${params.id}:`, error);
    return NextResponse.json(
      {
        status: "error",
        message: "발전소 정보를 가져오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/plants/[id] - 발전소 정보 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          status: "error",
          message: "유효하지 않은 발전소 ID입니다.",
        },
        { status: 400 }
      );
    }

    // 수정할 발전소 찾기
    const plantIndex = fakePlants.findIndex((p) => p.id === id);

    if (plantIndex === -1) {
      return NextResponse.json(
        {
          status: "error",
          message: `ID: ${id}에 해당하는 발전소를 찾을 수 없습니다.`,
        },
        { status: 404 }
      );
    }

    // 업데이트할 데이터 파싱
    const updateData = await request.json();

    // 기존 발전소 정보
    const existingPlant = fakePlants[plantIndex];

    // 변경된 정보 적용 (깊은 병합)
    const updatedPlant = {
      ...existingPlant,
      modified_at: new Date().toISOString(),
      status: updateData.status || existingPlant.status,
      infra: {
        ...existingPlant.infra,
        ...updateData.infra,
      },
      ...(updateData.contract && {
        contract: {
          ...existingPlant.contract,
          ...updateData.contract,
          modified_at: new Date().toISOString(),
        },
      }),
      ...(updateData.monitoring && {
        monitoring: {
          ...existingPlant.monitoring,
          ...updateData.monitoring,
        },
      }),
    };

    // 발전소 정보 업데이트
    fakePlants[plantIndex] = updatedPlant;

    // 변경 이력 생성
    const historyData = {
      id: uuidv4(),
      plantId: id.toString(),
      type: "update",
      changes: {
        before: existingPlant,
        after: updatedPlant,
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
      data: updatedPlant,
    });
  } catch (error) {
    console.error(`Error updating plant with ID ${params.id}:`, error);
    return NextResponse.json(
      {
        status: "error",
        message: "발전소 정보를 수정하는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/plants/[id] - 발전소 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          status: "error",
          message: "유효하지 않은 발전소 ID입니다.",
        },
        { status: 400 }
      );
    }

    // 삭제할 발전소 찾기
    const plantIndex = fakePlants.findIndex((p) => p.id === id);

    if (plantIndex === -1) {
      return NextResponse.json(
        {
          status: "error",
          message: `ID: ${id}에 해당하는 발전소를 찾을 수 없습니다.`,
        },
        { status: 404 }
      );
    }

    // 삭제 전 발전소 정보 저장
    const deletedPlant = fakePlants[plantIndex];

    // 발전소 삭제
    fakePlants.splice(plantIndex, 1);

    // 삭제 이력 생성
    const historyData = {
      id: uuidv4(),
      plantId: id.toString(),
      type: "delete",
      changes: {
        before: deletedPlant,
        after: null,
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
      message: `ID: ${id} 발전소가 성공적으로 삭제되었습니다.`,
    });
  } catch (error) {
    console.error(`Error deleting plant with ID ${params.id}:`, error);
    return NextResponse.json(
      {
        status: "error",
        message: "발전소를 삭제하는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
