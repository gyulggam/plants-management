"use client";

import { useState, useEffect } from "react";
import { Mail } from "@/types/mail";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ComposeMail } from "./compose-mail";

export function MailList() {
  const [mails, setMails] = useState<Mail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 발송한 메일 목록 가져오기
  const fetchMails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/mail");
      if (response.ok) {
        const data = await response.json();
        setMails(data);
      }
    } catch (error) {
      console.error("메일 목록 로드 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 메일 목록 가져오기
  useEffect(() => {
    fetchMails();
  }, []);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")} ${String(
      date.getHours()
    ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  // 수신자 목록 문자열 반환
  const getRecipientString = (mail: Mail) => {
    const recipients = mail.recipients
      .filter((r) => r.type === "to")
      .map((r) => r.name || r.email);
    return recipients.length > 0
      ? recipients.join(", ") +
          (mail.recipients.length > recipients.length
            ? ` 외 ${mail.recipients.length - recipients.length}명`
            : "")
      : "없음";
  };

  // 메일 내용 보기 다이얼로그
  const MailDetailDialog = () => {
    if (!selectedMail) return null;

    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMail.subject}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* 메일 정보 */}
            <div className="space-y-2 text-sm border-b pb-2">
              <div>
                <strong>발신자:</strong> {selectedMail.senderName} (
                {selectedMail.senderEmail})
              </div>
              <div>
                <strong>수신자:</strong>{" "}
                {selectedMail.recipients
                  .filter((r) => r.type === "to")
                  .map((r) => r.name || r.email)
                  .join(", ")}
              </div>

              {selectedMail.recipients.some((r) => r.type === "cc") && (
                <div>
                  <strong>참조:</strong>{" "}
                  {selectedMail.recipients
                    .filter((r) => r.type === "cc")
                    .map((r) => r.name || r.email)
                    .join(", ")}
                </div>
              )}

              {selectedMail.recipients.some((r) => r.type === "bcc") && (
                <div>
                  <strong>숨은 참조:</strong>{" "}
                  {selectedMail.recipients
                    .filter((r) => r.type === "bcc")
                    .map((r) => r.name || r.email)
                    .join(", ")}
                </div>
              )}

              <div>
                <strong>발송 시간:</strong>{" "}
                {formatDate(selectedMail.sentAt || selectedMail.createdAt)}
              </div>
            </div>

            {/* 첨부 파일 */}
            {selectedMail.attachments.length > 0 && (
              <div className="space-y-2 border-b pb-2">
                <div className="font-medium">
                  첨부 파일 ({selectedMail.attachments.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedMail.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md text-sm flex items-center gap-1"
                    >
                      {attachment.fileName} (
                      {(attachment.fileSize / 1024).toFixed(1)} KB)
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 메일 내용 */}
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: selectedMail.content }} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">발송한 메일</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchMails} disabled={isLoading}>
            {isLoading ? "로딩 중..." : "새로고침"}
          </Button>
          <ComposeMail onMailSent={fetchMails} />
        </div>
      </div>

      {isLoading ? (
        <div className="h-60 flex items-center justify-center">
          <div className="animate-pulse text-lg">
            메일 목록을 불러오는 중...
          </div>
        </div>
      ) : mails.length === 0 ? (
        <div className="h-60 flex items-center justify-center text-gray-500">
          발송한 메일이 없습니다.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>수신자</TableHead>
              <TableHead>첨부</TableHead>
              <TableHead>발송 시간</TableHead>
              <TableHead>상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mails.map((mail) => (
              <TableRow
                key={mail.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  setSelectedMail(mail);
                  setIsDialogOpen(true);
                }}
              >
                <TableCell className="font-medium">{mail.subject}</TableCell>
                <TableCell>{getRecipientString(mail)}</TableCell>
                <TableCell>
                  {mail.attachments.length > 0
                    ? `${mail.attachments.length}개`
                    : "-"}
                </TableCell>
                <TableCell>
                  {formatDate(mail.sentAt || mail.createdAt)}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      mail.status === "sent"
                        ? "bg-green-100 text-green-800"
                        : mail.status === "failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {mail.status === "sent"
                      ? "발송 완료"
                      : mail.status === "failed"
                      ? "발송 실패"
                      : "임시 저장"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <MailDetailDialog />
    </div>
  );
}
