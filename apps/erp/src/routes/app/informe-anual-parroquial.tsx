import { createFileRoute } from "@tanstack/react-router";
import { ParishReportScreen } from "@/components/modules/parish-report-screen";

export const Route = createFileRoute("/app/informe-anual-parroquial")({
  component: ParishReportScreen,
});
