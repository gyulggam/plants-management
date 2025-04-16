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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Search, Filter, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function MailHistoryPage() {
  const router = useRouter();
  const [mails, setMails] = useState<Mail[]>([]);
  const [filteredMails, setFilteredMails] = useState<Mail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // 발송한 메일 목록 가져오기
  const fetchMails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/mail");
      if (response.ok) {
        const data = await response.json();
        setMails(data);
        setFilteredMails(data);
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

  // 검색 및 필터 적용
  useEffect(() => {
    let result = [...mails];

    // 검색어 필터링
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (mail) =>
          mail.subject.toLowerCase().includes(searchLower) ||
          mail.recipients.some(
            (r) =>
              (r.name && r.name.toLowerCase().includes(searchLower)) ||
              r.email.toLowerCase().includes(searchLower)
          )
      );
    }

    // 상태 필터링
    if (statusFilter !== "all") {
      result = result.filter((mail) => mail.status === statusFilter);
    }

    // 날짜 필터링
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      result = result.filter((mail) => {
        const mailDate = new Date(mail.sentAt || mail.createdAt);

        switch (dateFilter) {
          case "today":
            return mailDate >= today;
          case "yesterday":
            return mailDate >= yesterday && mailDate < today;
          case "week":
            return mailDate >= lastWeek;
          case "month":
            return mailDate >= lastMonth;
          default:
            return true;
        }
      });
    }

    setFilteredMails(result);
  }, [mails, searchTerm, statusFilter, dateFilter]);

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
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/mail")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">메일 발송내역</h1>
          </div>

          <Button
            variant="outline"
            onClick={fetchMails}
            disabled={isLoading}
            className="gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            새로고침
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>필터 및 검색</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="search">검색어</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="제목 또는 수신자로 검색"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="status">상태</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="모든 상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 상태</SelectItem>
                    <SelectItem value="sent">발송 완료</SelectItem>
                    <SelectItem value="failed">발송 실패</SelectItem>
                    <SelectItem value="draft">임시 저장</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="date">기간</Label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger id="date">
                    <SelectValue placeholder="모든 기간" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 기간</SelectItem>
                    <SelectItem value="today">오늘</SelectItem>
                    <SelectItem value="yesterday">어제</SelectItem>
                    <SelectItem value="week">최근 7일</SelectItem>
                    <SelectItem value="month">최근 30일</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                className="gap-1"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setDateFilter("all");
                }}
              >
                <Filter className="h-4 w-4" />
                필터 초기화
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="h-60 flex items-center justify-center">
                <div className="animate-pulse text-lg">
                  메일 목록을 불러오는 중...
                </div>
              </div>
            ) : filteredMails.length === 0 ? (
              <div className="h-60 flex items-center justify-center text-gray-500">
                {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                  ? "검색 조건에 맞는 메일이 없습니다."
                  : "발송한 메일이 없습니다."}
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
                  {filteredMails.map((mail) => (
                    <TableRow
                      key={mail.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelectedMail(mail);
                        setIsDialogOpen(true);
                      }}
                    >
                      <TableCell className="font-medium">
                        {mail.subject}
                      </TableCell>
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
          </CardContent>
        </Card>

        <MailDetailDialog />
      </div>
    </DashboardLayout>
  );
}

// 이 페이지는 동적으로 렌더링됩니다 (SSR)
export const dynamic = "force-dynamic";
