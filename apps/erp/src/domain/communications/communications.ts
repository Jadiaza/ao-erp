export type MessageChannel = "email" | "sms" | "push" | "in_app";
export type MessageStatus = "draft" | "approved" | "queued" | "sent" | "failed" | "cancelled";
export type OutboundMessage = { id: string; channel: MessageChannel; recipientId: string; purpose: "transactional" | "pastoral" | "announcement"; consentRequired: boolean; consentGranted: boolean; content: string; status: MessageStatus; scheduledAt?: string; sentAt?: string; attempts: number };
export function validateOutboundMessage(message: OutboundMessage): string[] {
  const errors: string[] = [];
  if (!message.recipientId.trim() || !message.content.trim()) errors.push("MESSAGE_RECIPIENT_AND_CONTENT_REQUIRED");
  if (message.consentRequired && !message.consentGranted) errors.push("MESSAGE_CONSENT_REQUIRED");
  if (!Number.isInteger(message.attempts) || message.attempts < 0) errors.push("MESSAGE_ATTEMPTS_INVALID");
  if (message.status === "sent" && !message.sentAt) errors.push("MESSAGE_SENT_TIMESTAMP_REQUIRED");
  return errors;
}
export function queueMessage(message: OutboundMessage): OutboundMessage {
  if (message.status !== "approved" && message.status !== "draft") throw new Error("MESSAGE_NOT_QUEUEABLE");
  const errors = validateOutboundMessage(message);
  if (errors.length) throw new Error(errors.join("|"));
  return { ...message, status: "queued" };
}
export function markMessageSent(message: OutboundMessage, sentAt: string): OutboundMessage {
  if (message.status !== "queued") throw new Error("MESSAGE_NOT_QUEUED");
  if (!sentAt.trim()) throw new Error("MESSAGE_SENT_TIMESTAMP_REQUIRED");
  return { ...message, status: "sent", sentAt, attempts: message.attempts + 1 };
}
