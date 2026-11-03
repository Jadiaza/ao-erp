import { createFileRoute } from "@tanstack/react-router";
import { AiAssistantScreen } from "@/components/modules/ai-assistant-screen";

export const Route = createFileRoute("/app/inteligencia-artificial")({
  component: AiAssistantScreen,
});
