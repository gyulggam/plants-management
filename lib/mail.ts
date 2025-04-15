import nodemailer from "nodemailer";
import { Contact, Mail, SendMailRequest } from "../types/mail";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import os from "os";

// Gmail SMTP 설정 또는 테스트 계정 사용
let transporter: nodemailer.Transporter;

// 트랜스포터 생성 함수
const createTransporter = async () => {
  // 환경 변수에서 SMTP 정보 가져오기
  const useGmail = process.env.SMTP_USER && process.env.SMTP_PASS;

  if (useGmail) {
    // Gmail SMTP 서버 설정
    console.log("Gmail SMTP 서버 사용 설정 중...");
    console.log(
      `SMTP 설정: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}, Secure: ${process.env.SMTP_SECURE}`
    );

    // SSL/TLS 옵션으로 보안 연결 설정
    const secure = process.env.SMTP_SECURE === "true";
    const port = Number(process.env.SMTP_PORT) || (secure ? 465 : 587);

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: secure, // true = 465, false = 587, other
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Gmail에 맞는 보안 설정
      tls: {
        // SSL 검증 활성화 (프로덕션에서는 true 권장)
        rejectUnauthorized: true,
      },
      // 디버그 모드 활성화
      logger: true,
      debug: true,
    });

    // 연결 테스트
    try {
      await transporter.verify();
      console.log("SMTP 서버 연결 성공!");
      return transporter;
    } catch (error) {
      console.error("SMTP 서버 연결 실패:", error);
      console.log("Ethereal 테스트 계정으로 대체합니다.");
    }
  }

  // Gmail 설정이 없거나 연결 실패 시 Ethereal 테스트 계정 사용
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
      debug: true,
    });

    return transporter;
  } catch (error) {
    console.error("Ethereal 테스트 계정 생성 실패:", error);

    // 기본 설정으로 대체
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: "example@ethereal.email",
        pass: "examplepass",
      },
    });

    return transporter;
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
        name: "홍길동",
        email: "hong@naver.com", // 네이버 메일로 변경
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: "김철수",
        email: "kim@example.com",
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
    await createTransporter();
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
      status: "sent",
      sentAt: now,
      createdAt: now,
      updatedAt: now,
    };

    // 수신자 목록 분리
    const toRecipients = recipients.filter((r) => r.type === "to");
    const ccRecipients = recipients.filter((r) => r.type === "cc");
    const bccRecipients = recipients.filter((r) => r.type === "bcc");

    const toEmails =
      toRecipients.length > 0
        ? toRecipients.map((r) => `${r.name} <${r.email}>`).join(", ")
        : "";

    const ccEmails =
      ccRecipients.length > 0
        ? ccRecipients.map((r) => `${r.name} <${r.email}>`).join(", ")
        : undefined;

    const bccEmails =
      bccRecipients.length > 0
        ? bccRecipients.map((r) => `${r.name} <${r.email}>`).join(", ")
        : undefined;

    // 네이버 이메일 처리를 위한 이스케이프 문자열 제거
    const sanitizeRecipients = (emailList?: string) => {
      return emailList?.replace(/"/g, "");
    };

    // nodemailer로 실제 메일 발송
    try {
      console.log("메일 전송 시도:", {
        from: `${userName} <${process.env.SMTP_USER}>`,
        to: toEmails,
        cc: ccEmails,
        bcc: bccEmails,
        subject: data.subject,
        attachments: nodemailerAttachments.length,
      });

      // 메일 옵션 구성
      const mailOptions = {
        from: `${userName} <${process.env.SMTP_USER}>`, // 따옴표 제거
        to: sanitizeRecipients(toEmails),
        cc: sanitizeRecipients(ccEmails),
        bcc: sanitizeRecipients(bccEmails),
        subject: data.subject,
        html: data.content,
        attachments:
          nodemailerAttachments.length > 0 ? nodemailerAttachments : undefined,
      };

      const info = await transporter.sendMail(mailOptions);

      console.log("메일 전송 성공:", info.messageId);

      // 테스트 계정 사용 시 URL 로깅
      if (info.messageId && info.messageId.includes("ethereal")) {
        console.log("Ethereal URL:", nodemailer.getTestMessageUrl(info));
      }

      // 상태 업데이트 및 결과 URL 추가
      mail.status = "sent";
      mail.sentAt = now;
    } catch (error) {
      console.error("메일 전송 실패:", error);
      mail.status = "failed";
    }

    // 보낸 메일 저장
    if (!sentMails[userId]) {
      sentMails[userId] = [];
    }
    sentMails[userId].push(mail);

    return mail;
  } catch (error) {
    console.error("메일 객체 생성 실패:", error);
    throw new Error("메일 발송 준비 중 오류가 발생했습니다.");
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
