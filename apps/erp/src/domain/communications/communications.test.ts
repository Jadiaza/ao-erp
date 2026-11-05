import { describe, expect, it } from "vitest";
import { queueMessage, type OutboundMessage } from "./communications";
describe("comunicaciones", () => {
  it("bloquea envíos sin consentimiento requerido", () => {
    const message: OutboundMessage = { id: "m1", channel: "email", recipientId: "p1", purpose: "announcement", consentRequired: true, consentGranted: false, content: "Aviso", status: "draft", attempts: 0 };
    expect(() => queueMessage(message)).toThrow("MESSAGE_CONSENT_REQUIRED");
  });
});
