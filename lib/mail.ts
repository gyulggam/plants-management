import nodemailer from "nodemailer";
import { Contact, Mail, SendMailRequest } from "../types/mail";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import os from "os";

// SMTP 설정 또는 테스트 계정 사용
let transporter: nodemailer.Transporter;

// 트랜스포터 생성 함수
const createTransporter = async () => {
  // 환경 변수에서 SMTP 정보 가져오기
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpSecure = process.env.SMTP_SECURE === "true";

  // SMTP 설정이 있는지 확인
  if (smtpUser && smtpPass) {
    console.log("SMTP 서버 설정 중...");
    console.log(`SMTP 설정: ${smtpHost}:${smtpPort}, Secure: ${smtpSecure}`);

    try {
      // SMTP 설정으로 트랜스포터 생성
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          // SSL 검증 활성화 (프로덕션에서는 true 권장)
          rejectUnauthorized: true,
        },
        // 개발 환경에서만 디버그 활성화
        ...(process.env.NODE_ENV !== "production" && {
          logger: true,
          debug: true,
        }),
      });

      // 연결 테스트
      await transporter.verify();
      console.log("SMTP 서버 연결 성공!");
      return transporter;
    } catch (error) {
      console.error("SMTP 서버 연결 실패:", error);
      console.log("Ethereal 테스트 계정으로 대체합니다.");
    }
  } else {
    console.log(
      "SMTP 환경 변수가 설정되지 않았습니다. Ethereal 테스트 계정을 사용합니다."
    );
  }

  // SMTP 설정이 없거나 연결 실패 시 Ethereal 테스트 계정 사용
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log("Ethereal 테스트 계정 생성:", testAccount.user);

    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
      ...(process.env.NODE_ENV !== "production" && {
        debug: true,
      }),
    });

    console.log("Ethereal SMTP 서버 설정 완료");
    return transporter;
  } catch (error) {
    console.error("Ethereal 테스트 계정 생성 실패:", error);
    throw new Error("메일 서버 설정에 실패했습니다. 관리자에게 문의하세요.");
  }
};

// 임시 저장소 (실제 프로덕션에서는 DB 사용 필요)
const userContacts: Record<string, Contact[]> = {};
const sentMails: Record<string, Mail[]> = {};

// 연락처 관련 함수들
export async function getUserContacts(userId: string): Promise<Contact[]> {
  // 실제 구현에서는 DB에서 연락처 조회
  if (!userContacts[userId]) {
    // 테스트를 위한 초기 더미 데이터
    userContacts[userId] = [
      {
        id: uuidv4(),
        name: "쥐메일TEST",
        email: "kjs2kjs2@gmail.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "네이버TEST",
        email: "67sc2@naver.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
  return userContacts[userId] || [];
}

export async function addContact(
  userId: string,
  contact: Omit<Contact, "id" | "createdAt" | "updatedAt">
): Promise<Contact> {
  const newContact: Contact = {
    id: uuidv4(),
    ...contact,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!userContacts[userId]) {
    userContacts[userId] = [];
  }

  userContacts[userId].push(newContact);
  return newContact;
}

// 첨부 파일을 위한 임시 디렉토리 생성 및 파일 저장
async function saveTempFile(
  fileData: File
): Promise<{ path: string; filename: string }> {
  const tempDir = path.join(os.tmpdir(), "mail-attachments");

  // 임시 디렉토리가 없으면 생성
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // 파일 처리 - File 객체에서 ArrayBuffer로 변환
  const arrayBuffer = await fileData.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 고유한 파일명 생성
  const filename = `${Date.now()}-${fileData.name}`;
  const filePath = path.join(tempDir, filename);

  // 파일 저장
  fs.writeFileSync(filePath, buffer);

  return {
    path: filePath,
    filename: fileData.name,
  };
}

// 메일 발송 관련 함수들
export async function sendMail(
  userId: string,
  userName: string,
  userEmail: string,
  data: SendMailRequest
): Promise<Mail> {
  // 트랜스포터가 없으면 생성
  if (!transporter) {
    try {
      await createTransporter();
    } catch (error) {
      console.error("트랜스포터 생성 실패:", error);
      return {
        id: uuidv4(),
        subject: data.subject,
        content: data.content,
        senderId: userId,
        senderName: userName,
        senderEmail: userEmail,
        recipients: data.recipients.map((r) => ({
          id: uuidv4(),
          name: r.name || r.email.split("@")[0],
          email: r.email,
          type: r.type,
        })),
        attachments: [],
        status: "failed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  }

  try {
    // 메일 객체 생성
    const now = new Date().toISOString();
    const mailId = uuidv4();

    // 첨부 파일 처리 (실제 파일 저장 및 nodemailer 첨부 파일 형식 변환)
    const mailAttachments = [];
    const nodemailerAttachments = [];

    if (data.attachments && data.attachments.length > 0) {
      console.log(`첨부 파일 처리 중: ${data.attachments.length}개`);

      // 각 첨부 파일 처리
      for (const file of data.attachments) {
        try {
          // 임시 파일로 저장
          const tempFile = await saveTempFile(file);

          // 메일 객체용 첨부 파일 정보
          mailAttachments.push({
            id: uuidv4(),
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileUrl: tempFile.path, // 실제 파일 경로 저장
            mailId: mailId,
            createdAt: now,
          });

          // nodemailer용 첨부 파일 형식
          nodemailerAttachments.push({
            filename: file.name,
            path: tempFile.path,
            contentType: file.type,
          });

          console.log(
            `첨부 파일 저장 완료: ${file.name}, 크기: ${file.size} bytes`
          );
        } catch (error) {
          console.error(`첨부 파일 처리 오류 (${file.name}):`, error);
        }
      }
    }

    // recipients 배열 생성
    const recipients = data.recipients.map((r) => ({
      id: uuidv4(),
      name: r.name || r.email.split("@")[0],
      email: r.email,
      type: r.type,
    }));

    // 메일 객체 생성
    const mail: Mail = {
      id: mailId,
      subject: data.subject,
      content: data.content,
      senderId: userId,
      senderName: userName,
      senderEmail: userEmail,
      recipients,
      attachments: mailAttachments,
      status: "sending", // 상태를 sending으로 초기화
      createdAt: now,
      updatedAt: now,
    };

    // 수신자 목록 분리
    const toRecipients = recipients
      .filter((r) => r.type === "to")
      .map((r) => r.email);
    const ccRecipients = recipients
      .filter((r) => r.type === "cc")
      .map((r) => r.email);
    const bccRecipients = recipients
      .filter((r) => r.type === "bcc")
      .map((r) => r.email);

    // 수신자가 없는 경우 오류 처리
    if (toRecipients.length === 0) {
      throw new Error("최소 한 명 이상의 수신자가 필요합니다.");
    }

    // nodemailer로 메일 발송
    const mailOptions = {
      from: {
        name: userName,
        address: userEmail,
      },
      to: toRecipients.join(", "),
      cc: ccRecipients.length > 0 ? ccRecipients.join(", ") : undefined,
      bcc: bccRecipients.length > 0 ? bccRecipients.join(", ") : undefined,
      subject: data.subject,
      html: data.content,
      attachments: nodemailerAttachments,
    };

    console.log("메일 발송 시도:", {
      to: toRecipients,
      cc: ccRecipients,
      bcc: bccRecipients,
      subject: data.subject,
    });

    // 메일 발송 (반환값에서 성공 여부 확인)
    const info = await transporter.sendMail(mailOptions);
    console.log("메일 발송 완료:", info.messageId);

    // 발송 성공한 메일의 링크 출력 (Ethereal 테스트 계정 사용 시)
    if (info.messageId && process.env.NODE_ENV !== "production") {
      console.log("미리보기 URL:", nodemailer.getTestMessageUrl(info));
    }

    // 메일 상태 업데이트 (성공)
    mail.status = "sent";
    mail.sentAt = now;

    // 저장
    if (!sentMails[userId]) {
      sentMails[userId] = [];
    }
    sentMails[userId].unshift(mail); // 최신 메일이 앞에 오도록 추가

    return mail;
  } catch (error) {
    console.error("메일 발송 오류:", error);

    // 실패 시 에러 정보와 함께 객체 생성
    const failedMail: Mail = {
      id: uuidv4(),
      subject: data.subject,
      content: data.content,
      senderId: userId,
      senderName: userName,
      senderEmail: userEmail,
      recipients: data.recipients.map((r) => ({
        id: uuidv4(),
        name: r.name || r.email.split("@")[0],
        email: r.email,
        type: r.type,
      })),
      attachments: [],
      status: "failed",
      error: error instanceof Error ? error.message : "알 수 없는 오류",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 실패한 메일도 목록에 저장
    if (!sentMails[userId]) {
      sentMails[userId] = [];
    }
    sentMails[userId].unshift(failedMail);

    return failedMail;
  }
}

// 발송한 메일 목록 조회
export async function getSentMails(userId: string): Promise<Mail[]> {
  return sentMails[userId] || [];
}

// 단일 메일 조회
export async function getMailById(
  userId: string,
  mailId: string
): Promise<Mail | null> {
  const userMails = sentMails[userId] || [];
  return userMails.find((mail) => mail.id === mailId) || null;
}
