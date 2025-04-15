import { NextRequest, NextResponse } from "next/server";
import { getUserContacts, addContact } from "@/lib/mail";

// 연락처 목록 조회 API
export async function GET() {
  try {
    // 실제 구현에서는 auth 세션에서 사용자 정보를 가져와야 함
    const userId = "current-user-id";

    const contacts = await getUserContacts(userId);
    return NextResponse.json(contacts);
  } catch (error) {
    console.error("연락처 목록 조회 API 오류:", error);
    return NextResponse.json(
      { error: "연락처 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 연락처 추가 API
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // 실제 구현에서는 auth 세션에서 사용자 정보를 가져와야 함
    const userId = "current-user-id";

    // 필수 필드 검증
    if (!data.name || !data.email) {
      return NextResponse.json(
        { error: "이름과 이메일은 필수입니다." },
        { status: 400 }
      );
    }

    // 연락처 추가
    const result = await addContact(userId, {
      name: data.name,
      email: data.email,
      groupId: data.groupId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("연락처 추가 API 오류:", error);
    return NextResponse.json(
      { error: "연락처 추가 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
