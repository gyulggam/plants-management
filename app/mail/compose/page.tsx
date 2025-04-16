"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ArrowLeft, X, Paperclip, UserPlus, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Contact } from "@/types/mail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 폼 스키마 정의
const formSchema = z.object({
  subject: z.string().min(1, {
    message: "제목을 입력해주세요.",
  }),
  content: z.string().min(1, {
    message: "내용을 입력해주세요.",
  }),
  recipients: z
    .array(
      z.object({
        email: z.string().email("유효한 이메일 주소가 아닙니다."),
        name: z.string().optional(),
        type: z.enum(["to", "cc", "bcc"]),
      })
    )
    .min(1, {
      message: "최소 한 명 이상의 수신자가 필요합니다.",
    }),
});

const contactFormSchema = z.object({
  name: z.string().min(1, "이름은 필수입니다."),
  email: z.string().email("유효한 이메일 주소가 아닙니다."),
});

type FormData = z.infer<typeof formSchema>;
type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ComposeMailPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string>("");
  const [recipientType, setRecipientType] = useState<"to" | "cc" | "bcc">("to");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [isContactLoading, setIsContactLoading] = useState(false);
  const [directEmail, setDirectEmail] = useState("");
  const [directName, setDirectName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      content: "",
      recipients: [],
    },
  });

  const contactForm = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  // 연락처 목록 가져오기
  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/mail/contacts");
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (error) {
      console.error("연락처 로드 오류:", error);
    }
  };

  // 연락처 목록 불러오기
  useState(() => {
    fetchContacts();
  });

  // 새 연락처 추가
  const onSubmitContact = async (data: ContactFormData) => {
    setIsContactLoading(true);
    try {
      const response = await fetch("/api/mail/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newContact = await response.json();
        setContacts((prev) => [...prev, newContact]);
        setShowAddContact(false);
        contactForm.reset();
        toast.success("연락처 추가 완료", {
          description: `${data.name} (${data.email}) 연락처가 추가되었습니다.`,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "연락처 추가에 실패했습니다.");
      }
    } catch (error) {
      toast.error("연락처 추가 실패", {
        description:
          error instanceof Error
            ? error.message
            : "연락처 추가 중 오류가 발생했습니다.",
      });
    } finally {
      setIsContactLoading(false);
    }
  };

  // 수신자 추가 함수 (기존 연락처에서)
  const handleAddRecipient = () => {
    if (!selectedContact) return;

    const contact = contacts.find((c) => c.id === selectedContact);
    if (!contact) return;

    const currentRecipients = form.getValues("recipients") || [];

    // 이미 동일한 이메일과 타입으로 추가된 수신자가 있는지 확인
    const isDuplicate = currentRecipients.some(
      (r) => r.email === contact.email && r.type === recipientType
    );

    if (!isDuplicate) {
      form.setValue("recipients", [
        ...currentRecipients,
        {
          email: contact.email,
          name: contact.name,
          type: recipientType,
        },
      ]);

      // 선택 항목 초기화
      setSelectedContact("");

      toast.success("수신자 추가 완료", {
        description: `${contact.name} (${contact.email})가 ${
          recipientType === "to"
            ? "받는 사람"
            : recipientType === "cc"
            ? "참조"
            : "숨은 참조"
        }에 추가되었습니다.`,
      });
    } else {
      toast.error("수신자 추가 실패", {
        description: "이미 추가된 수신자입니다.",
      });
    }
  };

  // 직접 입력으로 수신자 추가
  const handleAddDirectRecipient = () => {
    if (!directEmail) return;

    // 이메일 유효성 검사
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(directEmail)) {
      toast.error("유효하지 않은 이메일", {
        description: "올바른 이메일 형식을 입력해주세요.",
      });
      return;
    }

    const currentRecipients = form.getValues("recipients") || [];

    // 이미 동일한 이메일과 타입으로 추가된 수신자가 있는지 확인
    const isDuplicate = currentRecipients.some(
      (r) => r.email === directEmail && r.type === recipientType
    );

    if (!isDuplicate) {
      form.setValue("recipients", [
        ...currentRecipients,
        {
          email: directEmail,
          name: directName || directEmail.split("@")[0], // 이름이 없으면 이메일 아이디 부분 사용
          type: recipientType,
        },
      ]);

      // 입력 필드 초기화
      setDirectEmail("");
      setDirectName("");

      toast.success("수신자 추가 완료", {
        description: `${directName || directEmail}이(가) ${
          recipientType === "to"
            ? "받는 사람"
            : recipientType === "cc"
            ? "참조"
            : "숨은 참조"
        }에 추가되었습니다.`,
      });
    } else {
      toast.error("수신자 추가 실패", {
        description: "이미 추가된 수신자입니다.",
      });
    }
  };

  // 수신자 삭제
  const handleRemoveRecipient = (email: string, type: "to" | "cc" | "bcc") => {
    const currentRecipients = form.getValues("recipients") || [];
    const updatedRecipients = currentRecipients.filter(
      (r) => !(r.email === email && r.type === type)
    );
    form.setValue("recipients", updatedRecipients);
  };

  // 파일 첨부 처리
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  // 첨부 파일 삭제
  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // 폼 제출 처리
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);

    try {
      // FormData 객체 생성 (첨부 파일 포함)
      const formData = new FormData();
      formData.append("subject", data.subject);
      formData.append("content", data.content);
      formData.append("recipients", JSON.stringify(data.recipients));

      // 첨부 파일 추가
      attachments.forEach((file, index) => {
        formData.append(`attachment-${index}`, file);
      });

      console.log("메일 발송 시작:", {
        subject: data.subject,
        recipientsCount: data.recipients.length,
        attachmentsCount: attachments.length,
      });

      // API 요청
      const response = await fetch("/api/mail", {
        method: "POST",
        body: formData,
        // 여기서는 Content-Type 헤더를 설정하지 않음
        // (브라우저가 multipart/form-data 경계를 자동으로 설정)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "메일 발송에 실패했습니다.");
      }

      toast.success("메일 발송 완료", {
        description: "메일이 성공적으로 발송되었습니다.",
      });

      // 발송 후 목록 페이지로 이동
      router.push("/mail/history");
    } catch (error) {
      console.error("메일 발송 오류:", error);
      toast.error("메일 발송 실패", {
        description:
          error instanceof Error
            ? error.message
            : "메일 발송 중 오류가 발생했습니다.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 연락처 선택 옵션 렌더링
  const contactOptions = contacts.map((contact) => (
    <SelectItem key={contact.id} value={contact.id}>
      {contact.name} ({contact.email})
    </SelectItem>
  ));

  // 수신자 타입별 목록 생성
  const getRecipientsByType = (type: "to" | "cc" | "bcc") => {
    return (form.getValues("recipients") || []).filter((r) => r.type === type);
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
            <h1 className="text-3xl font-bold">새 메일 작성</h1>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>수신자 정보</CardTitle>
                <CardDescription>
                  메일을 받을 대상을 지정하세요. 받는 사람은 필수입니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 수신자 목록 */}
                <div className="space-y-4">
                  {/* 받는 사람 (TO) */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>받는 사람</Label>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="gap-1"
                            onClick={() => {
                              setRecipientType("to");
                              fetchContacts();
                            }}
                          >
                            <UserPlus className="h-4 w-4" />
                            수신자 추가
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>수신자 추가</DialogTitle>
                          </DialogHeader>
                          <Tabs defaultValue="contacts" className="w-full">
                            <TabsList className="w-full">
                              <TabsTrigger value="contacts" className="flex-1">
                                연락처에서 선택
                              </TabsTrigger>
                              <TabsTrigger value="direct" className="flex-1">
                                직접 입력
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent
                              value="contacts"
                              className="space-y-4 mt-4"
                            >
                              <div className="flex justify-between">
                                <Select
                                  value={selectedContact}
                                  onValueChange={setSelectedContact}
                                >
                                  <SelectTrigger className="w-[240px]">
                                    <SelectValue placeholder="연락처 선택" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {contactOptions.length > 0 ? (
                                      contactOptions
                                    ) : (
                                      <SelectItem value="none" disabled>
                                        연락처가 없습니다
                                      </SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>

                                <Select
                                  value={recipientType}
                                  onValueChange={(value: "to" | "cc" | "bcc") =>
                                    setRecipientType(value)
                                  }
                                >
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="수신 유형" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="to">
                                      받는 사람
                                    </SelectItem>
                                    <SelectItem value="cc">참조</SelectItem>
                                    <SelectItem value="bcc">
                                      숨은 참조
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex justify-between items-center">
                                <Button
                                  variant="outline"
                                  type="button"
                                  onClick={() => setShowAddContact(true)}
                                  className="gap-1"
                                >
                                  <Plus className="h-4 w-4" />새 연락처
                                </Button>
                                <Button
                                  type="button"
                                  disabled={!selectedContact}
                                  onClick={handleAddRecipient}
                                >
                                  추가하기
                                </Button>
                              </div>
                            </TabsContent>

                            <TabsContent
                              value="direct"
                              className="space-y-4 mt-4"
                            >
                              <div className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="name">이름 (선택)</Label>
                                    <Input
                                      id="name"
                                      value={directName}
                                      onChange={(e) =>
                                        setDirectName(e.target.value)
                                      }
                                      placeholder="홍길동"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="email">이메일 (필수)</Label>
                                    <Input
                                      id="email"
                                      value={directEmail}
                                      onChange={(e) =>
                                        setDirectEmail(e.target.value)
                                      }
                                      placeholder="example@example.com"
                                      required
                                    />
                                  </div>
                                </div>

                                <div className="flex justify-between items-center">
                                  <Select
                                    value={recipientType}
                                    onValueChange={(
                                      value: "to" | "cc" | "bcc"
                                    ) => setRecipientType(value)}
                                  >
                                    <SelectTrigger className="w-[120px]">
                                      <SelectValue placeholder="수신 유형" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="to">
                                        받는 사람
                                      </SelectItem>
                                      <SelectItem value="cc">참조</SelectItem>
                                      <SelectItem value="bcc">
                                        숨은 참조
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    type="button"
                                    disabled={!directEmail}
                                    onClick={handleAddDirectRecipient}
                                  >
                                    추가하기
                                  </Button>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>

                          {showAddContact && (
                            <div className="border-t pt-4 mt-4">
                              <h4 className="font-medium mb-2">
                                새 연락처 추가
                              </h4>
                              <form
                                onSubmit={contactForm.handleSubmit(
                                  onSubmitContact
                                )}
                                className="space-y-4"
                              >
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="contact-name">이름</Label>
                                    <Input
                                      id="contact-name"
                                      {...contactForm.register("name")}
                                    />
                                    {contactForm.formState.errors.name && (
                                      <p className="text-sm text-red-500">
                                        {
                                          contactForm.formState.errors.name
                                            .message
                                        }
                                      </p>
                                    )}
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="contact-email">
                                      이메일
                                    </Label>
                                    <Input
                                      id="contact-email"
                                      {...contactForm.register("email")}
                                    />
                                    {contactForm.formState.errors.email && (
                                      <p className="text-sm text-red-500">
                                        {
                                          contactForm.formState.errors.email
                                            .message
                                        }
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowAddContact(false)}
                                  >
                                    취소
                                  </Button>
                                  <Button
                                    type="submit"
                                    disabled={isContactLoading}
                                  >
                                    {isContactLoading ? "저장 중..." : "저장"}
                                  </Button>
                                </div>
                              </form>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* 받는 사람 목록 */}
                    <div className="flex flex-wrap gap-2">
                      {getRecipientsByType("to").length === 0 ? (
                        <div className="text-muted-foreground text-sm">
                          받는 사람이 없습니다. 받는 사람은 최소 한 명 이상
                          필요합니다.
                        </div>
                      ) : (
                        getRecipientsByType("to").map((recipient, index) => (
                          <div
                            key={`to-${index}`}
                            className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                          >
                            {recipient.name || recipient.email}
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveRecipient(recipient.email, "to")
                              }
                              className="text-blue-700 hover:text-blue-900"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* 참조 (CC) */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>참조</Label>
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-1"
                        onClick={() => {
                          setRecipientType("cc");
                          document
                            .querySelector("[data-trigger-dialog]")
                            ?.dispatchEvent(
                              new MouseEvent("click", { bubbles: true })
                            );
                        }}
                      >
                        <UserPlus className="h-4 w-4" />
                        참조 추가
                      </Button>
                    </div>

                    {/* 참조 목록 */}
                    <div className="flex flex-wrap gap-2">
                      {getRecipientsByType("cc").length === 0 ? (
                        <div className="text-muted-foreground text-sm">
                          참조 수신자가 없습니다.
                        </div>
                      ) : (
                        getRecipientsByType("cc").map((recipient, index) => (
                          <div
                            key={`cc-${index}`}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                          >
                            {recipient.name || recipient.email}
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveRecipient(recipient.email, "cc")
                              }
                              className="text-gray-700 hover:text-gray-900"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* 숨은 참조 (BCC) */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>숨은 참조</Label>
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-1"
                        onClick={() => {
                          setRecipientType("bcc");
                          document
                            .querySelector("[data-trigger-dialog]")
                            ?.dispatchEvent(
                              new MouseEvent("click", { bubbles: true })
                            );
                        }}
                      >
                        <UserPlus className="h-4 w-4" />
                        숨은 참조 추가
                      </Button>
                    </div>

                    {/* 숨은 참조 목록 */}
                    <div className="flex flex-wrap gap-2">
                      {getRecipientsByType("bcc").length === 0 ? (
                        <div className="text-muted-foreground text-sm">
                          숨은 참조 수신자가 없습니다.
                        </div>
                      ) : (
                        getRecipientsByType("bcc").map((recipient, index) => (
                          <div
                            key={`bcc-${index}`}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                          >
                            {recipient.name || recipient.email}
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveRecipient(recipient.email, "bcc")
                              }
                              className="text-gray-700 hover:text-gray-900"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>메일 내용</CardTitle>
                <CardDescription>
                  전송할 메일의 제목과 내용을 작성하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 제목 폼 필드 */}
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>제목</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="메일 제목을 입력하세요"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 내용 폼 필드 */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>내용</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="메일 내용을 입력하세요"
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 첨부 파일 */}
                <div className="space-y-2">
                  <Label>첨부 파일</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-1"
                    >
                      <Paperclip className="h-4 w-4" />
                      파일 첨부
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {attachments.length > 0
                        ? `${attachments.length}개 파일 첨부됨`
                        : "파일을 첨부하려면 클릭하세요"}
                    </span>
                  </div>

                  {/* 첨부 파일 목록 */}
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="bg-gray-100 px-3 py-1 rounded-md text-sm flex items-center gap-1"
                        >
                          {file.name} ({(file.size / 1024).toFixed(1)} KB)
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(index)}
                            className="text-gray-700 hover:text-gray-900"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 제출 버튼 */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/mail")}
              >
                취소
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "발송 중..." : "메일 발송"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
