import { NextRequest, NextResponse } from "next/server";
import { sendMail, getSentMails } from "@/lib/mail";
import { SendMailRequest } from "@/types/mail";

// 메일 발송 API
export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as SendMailRequest;

    // 실제 구현에서는 auth 세션에서 사용자 정보를 가져와야 함
    const userId = "current-user-id";
    const userName = "사용자";
    const userEmail = "user@example.com";

    // 필수 필드 검증
    if (!data.subject || !data.subject.trim()) {
      return NextResponse.json(
        { error: "제목을 입력해주세요." },
        { status: 400 }
      );
    }

    if (!data.content || !data.content.trim()) {
      return NextResponse.json(
        { error: "내용을 입력해주세요." },
        { status: 400 }
      );
    }

    if (!data.recipients || data.recipients.length === 0) {
      return NextResponse.json(
        { error: "최소 한 명 이상의 수신자가 필요합니다." },
        { status: 400 }
      );
    }

    // 각 수신자의 이메일 유효성 검증
    for (const recipient of data.recipients) {
      if (!recipient.email || !recipient.email.includes("@")) {
        return NextResponse.json(
          { error: "유효하지 않은 이메일 주소가 포함되어 있습니다." },
          { status: 400 }
        );
      }
    }

    console.log("메일 발송 요청:", {
      subject: data.subject,
      recipientsCount: data.recipients.length,
      attachmentsCount: data.attachments?.length || 0,
    });

    // 메일 발송
    try {
      const result = await sendMail(userId, userName, userEmail, data);

      if (result.status === "failed") {
        return NextResponse.json(
          { error: "메일 서버 연결에 실패했습니다. 나중에 다시 시도해주세요." },
          { status: 500 }
        );
      }

      return NextResponse.json(result);
    } catch (error) {
      console.error("메일 발송 처리 오류:", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "메일 발송 중 오류가 발생했습니다.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("메일 API 요청 처리 오류:", error);
    return NextResponse.json(
      { error: "잘못된 요청 형식입니다." },
      { status: 400 }
    );
  }
}

// 발송 메일 목록 조회 API
export async function GET() {
  try {
    // 실제 구현에서는 auth 세션에서 사용자 정보를 가져와야 함
    const userId = "current-user-id";

    const mails = await getSentMails(userId);
    return NextResponse.json(mails);
  } catch (error) {
    console.error("메일 목록 조회 API 오류:", error);
    return NextResponse.json(
      { error: "메일 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
