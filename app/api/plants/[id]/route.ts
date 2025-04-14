import { NextRequest, NextResponse } from "next/server";
import { fakePlants } from "../data/fake-generator";
import { getPlantById } from "../data/utils";

// GET /api/plants/[id] - 발전소 상세 정보 조회
export async function GET(
  _: NextRequest,
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
  _: NextRequest,
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

    // 발전소 삭제
    fakePlants.splice(plantIndex, 1);

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
