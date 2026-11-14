import { Link, useRouterState } from "@tanstack/react-router";
import { LockKeyhole, ShieldAlert } from "lucide-react";
import { useAoCristianoSettings } from "@/lib/use-ao-cristiano";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ModuleAccessGuard({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { settings, canAccessPath, accessMessage } = useAoCristianoSettings();
  const message = accessMessage(pathname);

  if (canAccessPath(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center px-4 py-10">
      <Card className="w-full border-amber-200 shadow-sm">
        <CardHeader>
          <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <LockKeyhole className="size-6" />
          </div>
          <CardTitle className="text-xl text-[#12304A]">Acceso no habilitado por suscripción</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/70 p-4">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-800" />
            <p className="text-sm leading-relaxed text-amber-950">{message}</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            <p><strong>Perfil activo (demo local):</strong> {settings.profile === "cristiano" ? "A&O Cristiano" : settings.profile === "combinado" ? "Cristiano + Católico" : "A&O Católico"}</p>
            <p className="mt-1"><strong>Organización/sede:</strong> {settings.organizationId} · {settings.campusId}</p>
            <p className="mt-2 text-xs">Este control bloquea acceso funcional a rutas y operaciones del módulo. Al reactivar o ampliar la suscripción, la información conservada vuelve a estar disponible según permisos.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/">Ir al Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/app/configuracion">Configuración</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}