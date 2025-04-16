export interface Contact {
  id: string;
  name: string;
  email: string;
  groupId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactGroup {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MailAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  mailId: string;
  createdAt: string;
}

export interface Mail {
  id: string;
  subject: string;
  content: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  recipients: {
    id: string;
    name?: string;
    email: string;
    type: "to" | "cc" | "bcc";
  }[];
  attachments: {
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
    mailId: string;
    createdAt: string;
  }[];
  status: "sending" | "draft" | "sent" | "failed";
  error?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SendMailRequest {
  subject: string;
  content: string;
  recipients: {
    email: string;
    name?: string;
    type: "to" | "cc" | "bcc";
  }[];
  attachments?: File[];
}
