"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Contact } from "@/types/mail";
import { UserPlus } from "lucide-react";
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

interface ComposeMailProps {
  onMailSent?: () => void;
}

export function ComposeMail({ onMailSent }: ComposeMailProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  // 다이얼로그 열릴 때 연락처 목록 가져오기
  const handleDialogOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchContacts();
    }
  };

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

  // 수신자 제거 함수
  const handleRemoveRecipient = (email: string, type: "to" | "cc" | "bcc") => {
    const currentRecipients = form.getValues("recipients") || [];
    const newRecipients = currentRecipients.filter(
      (r) => !(r.email === email && r.type === type)
    );
    form.setValue("recipients", newRecipients);
  };

  // 파일 첨부 처리
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  // 첨부 파일 제거
  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // 메일 전송 처리
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          attachments,
        }),
      });

      if (response.ok) {
        toast.success("메일 발송 성공", {
          description: "메일이 성공적으로 발송되었습니다.",
        });

        // 폼 초기화
        form.reset();
        setAttachments([]);
        setIsOpen(false);

        // 발송 완료 이벤트
        if (onMailSent) {
          onMailSent();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "메일 발송에 실패했습니다.");
      }
    } catch (error) {
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="default" className="w-full">
            새 메일 작성
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>새 메일 작성</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 pt-4"
            >
              {/* 수신자 추가 */}
              <div className="space-y-4">
                <div className="flex gap-2 items-center">
                  <Select
                    value={recipientType}
                    onValueChange={(value: "to" | "cc" | "bcc") =>
                      setRecipientType(value)
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="받는 사람" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>수신 유형</SelectLabel>
                        <SelectItem value="to">받는 사람</SelectItem>
                        <SelectItem value="cc">참조</SelectItem>
                        <SelectItem value="bcc">숨은 참조</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Tabs defaultValue="contacts" className="w-full">
                    <TabsList className="grid grid-cols-2 mb-2">
                      <TabsTrigger value="contacts">
                        연락처에서 선택
                      </TabsTrigger>
                      <TabsTrigger value="direct">직접 입력</TabsTrigger>
                    </TabsList>

                    <TabsContent value="contacts" className="space-y-2">
                      <div className="flex gap-2">
                        <Select
                          value={selectedContact}
                          onValueChange={setSelectedContact}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="연락처 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>연락처</SelectLabel>
                              {contacts.length > 0 ? (
                                contacts.map((contact) => (
                                  <SelectItem
                                    key={contact.id}
                                    value={contact.id}
                                  >
                                    {contact.name} ({contact.email})
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem disabled value="no-contacts">
                                  연락처가 없습니다
                                </SelectItem>
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>

                        <Button
                          type="button"
                          onClick={handleAddRecipient}
                          disabled={!selectedContact}
                        >
                          추가
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setShowAddContact(true)}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="direct" className="space-y-2">
                      <div className="flex gap-2">
                        <div className="flex-1 space-y-2">
                          <Input
                            type="email"
                            placeholder="이메일 주소"
                            value={directEmail}
                            onChange={(e) => setDirectEmail(e.target.value)}
                          />
                          <Input
                            type="text"
                            placeholder="이름 (선택사항)"
                            value={directName}
                            onChange={(e) => setDirectName(e.target.value)}
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={handleAddDirectRecipient}
                          disabled={!directEmail}
                          className="self-start"
                        >
                          추가
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              {/* 수신자 목록 표시 */}
              <div className="space-y-2">
                <FormLabel>수신자 목록</FormLabel>
                <div className="border rounded-md p-2 min-h-[60px]">
                  {form.watch("recipients").length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {form.watch("recipients").map((recipient, index) => (
                        <div
                          key={`${recipient.email}-${recipient.type}-${index}`}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center gap-1 text-xs"
                        >
                          <span>
                            {recipient.type === "to"
                              ? "받는 사람: "
                              : recipient.type === "cc"
                              ? "참조: "
                              : "숨은 참조: "}
                            {recipient.name || recipient.email}
                          </span>
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() =>
                              handleRemoveRecipient(
                                recipient.email,
                                recipient.type
                              )
                            }
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">
                      선택된 수신자가 없습니다.
                    </div>
                  )}
                </div>
                <FormMessage>
                  {form.formState.errors.recipients?.message}
                </FormMessage>
              </div>

              {/* 제목 입력 */}
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>제목</FormLabel>
                    <FormControl>
                      <Input placeholder="메일 제목을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 내용 입력 */}
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

              {/* 파일 첨부 */}
              <div className="space-y-2">
                <FormLabel>첨부 파일</FormLabel>
                <div className="flex gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    파일 첨부
                  </Button>
                </div>

                {/* 첨부 파일 목록 */}
                {attachments.length > 0 && (
                  <div className="border rounded-md p-2">
                    <div className="space-y-1">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm"
                        >
                          <div className="truncate">
                            {file.name} ({(file.size / 1024).toFixed(1)} KB)
                          </div>
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleRemoveAttachment(index)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 전송 버튼 */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  취소
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "전송 중..." : "메일 전송"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 연락처 추가 다이얼로그 */}
      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>연락처 추가</DialogTitle>
          </DialogHeader>

          <Form {...contactForm}>
            <form
              onSubmit={contactForm.handleSubmit(onSubmitContact)}
              className="space-y-4"
            >
              <FormField
                control={contactForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름</FormLabel>
                    <FormControl>
                      <Input placeholder="이름을 입력하세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={contactForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="이메일 주소를 입력하세요"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddContact(false)}
                >
                  취소
                </Button>
                <Button type="submit" disabled={isContactLoading}>
                  {isContactLoading ? "추가 중..." : "연락처 추가"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
