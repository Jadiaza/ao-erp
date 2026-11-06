import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Church,
  FileText,
  HeartHandshake,
  HelpCircle,
  Home,
  Plus,
  UserRound,
} from "lucide-react";
import {
  DemoNotice,
  DetailDrawer,
  InfoItem,
  ModuleLayout,
  StatCard,
  StatusBadge,
} from "@/components/modules";
import { FormModal, FormSection, TextInputField } from "@/components/forms";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  parishServicesDemo,
  communityEventsDemo,
  type ParishRequestDemo,
} from "@/data/services-demo";
import { documentRequests, type DocumentRequestDemo } from "@/data/community-demo";
import { useLocalCollection } from "@/data/local-repository";
import { parishDemo, parishDemoSites } from "@/data/parish-demo";
import { parishioners } from "@/data/community-demo";

type PortalRequestFormValues = { kind: string; subject: string };

const serviceIcons = { document: FileText, calendar: CalendarDays, heart: HeartHandshake };

export function ParishionerPortalScreen() {
  const [tab, setTab] = useState("home");
  const [selected, setSelected] = useState<ParishRequestDemo | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const form = useForm<PortalRequestFormValues>({
    defaultValues: { kind: "", subject: "" },
    mode: "onBlur",
  });
  const { records: documentRecords, create } = useLocalCollection(
    "ao-erp:documents:requests",
    documentRequests,
  );
  const parishRequestsDemo: ParishRequestDemo[] = documentRecords.map(
    (item: DocumentRequestDemo) => ({
      id: item.id,
      kind: item.kind,
      created: item.requested,
      status:
        item.status === "approved"
          ? "Listo para recoger"
          : item.status === "pending"
            ? "En revisión"
            : "Recibido",
      step: item.status === "approved" ? 4 : item.status === "pending" ? 2 : 1,
      note: item.subject,
    }),
  );
  return (
    <ModuleLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Servicios" },
        { label: "Portal del feligrés" },
      ]}
      title="Portal del feligrés"
      description="Vista de ejemplo del espacio de autoservicio comunitario, diseñada para una experiencia sencilla y cercana."
      stats={
        <>
          <StatCard
            label="Solicitudes activas"
            value="2"
            icon={FileText}
            caption="Seguimiento personal de muestra"
          />
          <StatCard
            label="Próxima actividad"
            value="4 nov."
            icon={CalendarDays}
            caption="Encuentro de comunidad"
          />
          <StatCard
            label="Avisos nuevos"
            value="2"
            icon={Bell}
            caption="Información de la parroquia"
          />
          <StatCard
            label="Servicios disponibles"
            value="3"
            icon={HeartHandshake}
            caption="Orientación y trámites"
          />
        </>
      }
    >
      <DemoNotice>
        Portal ficticio mostrado desde la perspectiva de un feligrés. No existe inicio de sesión; el
        perfil y las solicitudes son ilustrativos y no permiten consultar datos de otras personas.
      </DemoNotice>
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-[#12304A] px-5 py-3 text-white">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white/10">
              <Church className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Mi comunidad</p>
              <p className="text-[11px] text-white/70">{parishDemo.officialName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-white hover:bg-white/10 hover:text-white"
            >
              <Bell className="size-4" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#B9934B]" />
            </Button>
            <Avatar className="size-8 border border-white/30">
              <AvatarFallback className="bg-white/15 text-xs text-white">PM</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className="grid min-h-[540px] md:grid-cols-[190px_minmax(0,1fr)]">
          <nav
            aria-label="Navegación del portal"
            className="hidden border-r bg-slate-50 p-3 md:block"
          >
            <p className="mb-2 px-3 pt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Mi espacio
            </p>
            {[
              { id: "home", label: "Resumen", icon: Home },
              { id: "requests", label: "Mis solicitudes", icon: FileText },
              { id: "calendar", label: "Agenda", icon: CalendarDays },
              { id: "community", label: "Mi comunidad", icon: HeartHandshake },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`mb-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium ${tab === item.id ? "bg-[#12304A] text-white" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  <Icon className="size-4" />
                  {item.label}
                </button>
              );
            })}
            <div className="mt-7 rounded-xl bg-[#244766]/5 p-3">
              <div className="flex items-center gap-2 text-[#244766]">
                <HelpCircle className="size-4" />
                <span className="text-xs font-semibold">¿Necesitas ayuda?</span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                Acércate a secretaría o consulta los canales de atención parroquial.
              </p>
            </div>
          </nav>
          <div className="min-w-0 bg-slate-50/70 p-4 sm:p-6">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="mb-4 flex h-auto flex-wrap md:hidden">
                <TabsTrigger value="home">Resumen</TabsTrigger>
                <TabsTrigger value="requests">Solicitudes</TabsTrigger>
                <TabsTrigger value="calendar">Agenda</TabsTrigger>
                <TabsTrigger value="community">Comunidad</TabsTrigger>
              </TabsList>
              <TabsContent value="home" className="mt-0 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[#B9934B]">
                      Mi portal parroquial
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#12304A]">
                      Hola, {parishioners[0]?.name ?? "Persona de muestra"}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Qué bueno encontrarnos. Aquí tienes las novedades de tu comunidad.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs text-slate-600">
                    <UserRound className="size-3.5 text-primary" />
                    {parishioners[0]?.name ?? "Persona de muestra"}
                  </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                  <Card className="border-0 bg-gradient-to-br from-[#12304A] to-[#244766] text-white shadow-sm">
                    <CardContent className="flex min-h-36 items-center justify-between p-5">
                      <div>
                        <p className="text-xs text-white/70">Una comunidad que camina unida</p>
                        <h3 className="mt-2 max-w-sm text-xl font-semibold">
                          Tu espacio para estar cerca de la vida parroquial.
                        </h3>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="mt-4 bg-white text-[#12304A] hover:bg-white/90"
                          onClick={() => setTab("calendar")}
                        >
                          Ver agenda <ChevronRight className="ml-1 size-4" />
                        </Button>
                      </div>
                      <HeartHandshake className="mr-5 hidden size-14 text-[#D5B874]/80 sm:block" />
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Bell className="size-4 text-[#B9934B]" />
                        Avisos para ti
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="border-l-2 border-[#B9934B] pl-3">
                        <p className="text-xs font-semibold">Horario de secretaría</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Atención en horario habitual esta semana.
                        </p>
                      </div>
                      <div className="border-l-2 border-primary/30 pl-3">
                        <p className="text-xs font-semibold">Jornada de servicio fraterno</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Te esperamos el 12 de noviembre.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#12304A]">Accesos a servicios</h3>
                    <span className="text-[11px] text-muted-foreground">Atención parroquial</span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    {parishServicesDemo.map((service) => {
                      const Icon = serviceIcons[service.icon as keyof typeof serviceIcons];
                      return (
                        <button
                          key={service.title}
                          onClick={() =>
                            setTab(service.icon === "calendar" ? "calendar" : "requests")
                          }
                          className="rounded-xl border bg-white p-4 text-left shadow-sm transition hover:border-primary/30"
                        >
                          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/5 text-primary">
                            <Icon className="size-4" />
                          </span>
                          <span className="mt-3 block text-sm font-semibold">{service.title}</span>
                          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                            {service.description}
                          </span>
                          <span className="mt-3 inline-flex items-center text-xs font-semibold text-primary">
                            Consultar <ChevronRight className="size-3.5" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="flex-row items-center justify-between pb-3">
                      <CardTitle className="text-sm">Seguimiento de solicitudes</CardTitle>
                      <button
                        onClick={() => setTab("requests")}
                        className="text-xs font-medium text-primary"
                      >
                        Ver todas
                      </button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {parishRequestsDemo.slice(0, 2).map((request) => (
                        <button
                          key={request.id}
                          onClick={() => setSelected(request)}
                          className="flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left"
                        >
                          <span>
                            <span className="block text-xs font-semibold">{request.kind}</span>
                            <span className="mt-1 block text-[11px] text-muted-foreground">
                              {request.id} · {request.created}
                            </span>
                          </span>
                          <StatusBadge
                            status={
                              request.status === "Recibido"
                                ? "approved"
                                : request.status === "Listo para recoger"
                                  ? "active"
                                  : "pending"
                            }
                            label={request.status}
                          />
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="flex-row items-center justify-between pb-3">
                      <CardTitle className="text-sm">Próxima actividad</CardTitle>
                      <button
                        onClick={() => setTab("calendar")}
                        className="text-xs font-medium text-primary"
                      >
                        Agenda completa
                      </button>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 rounded-xl bg-[#12304A]/[0.04] p-3">
                        <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-white text-[#12304A]">
                          <span className="text-[9px] font-bold">NOV</span>
                          <span className="text-lg font-bold leading-none">04</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Encuentro de comunidad</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            18:30 · {parishDemoSites.hall.name}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="requests" className="mt-0 space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#B9934B]">
                    Atención personal
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-[#12304A]">Mis solicitudes</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Consulta el avance de trámites enviados a la parroquia.
                  </p>
                </div>
                {parishRequestsDemo.map((request) => (
                  <button
                    key={request.id}
                    onClick={() => setSelected(request)}
                    className="w-full rounded-xl border bg-white p-4 text-left shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{request.kind}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {request.id} · Solicitada {request.created}
                        </p>
                      </div>
                      <StatusBadge
                        status={
                          request.status === "Recibido"
                            ? "approved"
                            : request.status === "Listo para recoger"
                              ? "active"
                              : "pending"
                        }
                        label={request.status}
                      />
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      {["Recibida", "En revisión", "Preparada", "Finalizada"].map(
                        (label, index) => (
                          <div key={label} className="flex flex-1 items-center gap-2">
                            <span
                              className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] ${index < request.step ? "bg-[#12304A] text-white" : "bg-slate-100 text-slate-400"}`}
                            >
                              {index < request.step ? <Check className="size-3" /> : index + 1}
                            </span>
                            <span className="hidden text-[10px] text-muted-foreground lg:block">
                              {label}
                            </span>
                            {index < 3 && (
                              <span
                                className={`h-px flex-1 ${index < request.step - 1 ? "bg-[#12304A]" : "bg-slate-200"}`}
                              />
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </button>
                ))}
                <Button className="gap-2" onClick={() => setFormOpen(true)}>
                  <Plus className="size-4" />
                  Iniciar una solicitud
                </Button>
              </TabsContent>
              <TabsContent value="calendar" className="mt-0 space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#B9934B]">
                    Vida comunitaria
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-[#12304A]">Agenda parroquial</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Celebraciones y actividades abiertas a la comunidad.
                  </p>
                </div>
                {communityEventsDemo.map((event) => (
                  <div
                    key={event.title}
                    className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm"
                  >
                    <div className="flex w-14 shrink-0 flex-col items-center rounded-lg bg-[#12304A]/5 px-2 py-2 text-[#12304A]">
                      <span className="text-[9px] font-bold">{event.date.split(" ")[1]}</span>
                      <span className="text-lg font-bold leading-none">
                        {event.date.split(" ")[0]}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{event.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {event.time} · {event.place}
                      </p>
                    </div>
                    <span className="hidden rounded-full bg-secondary/50 px-2.5 py-1 text-[10px] text-primary sm:block">
                      {event.type}
                    </span>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="community" className="mt-0">
                <Card className="border-0 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-[#12304A]">Nuestra comunidad</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {parishDemo.officialName} · {parishDemo.region}
                    </p>
                  </CardHeader>
                  <CardContent className="grid gap-5 sm:grid-cols-2">
                    <InfoItem label="Atención de secretaría">
                      Lunes a viernes · 9:00 a 13:00 y 14:00 a 17:00
                    </InfoItem>
                    <InfoItem label="Ubicación">{parishDemo.address}</InfoItem>
                    <InfoItem label="Vida comunitaria">
                      Grupos, formación, servicio y celebraciones
                    </InfoItem>
                    <InfoItem label="Orientación">
                      Solicita atención presencial en secretaría
                    </InfoItem>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <FormModal
        title="Nueva solicitud parroquial"
        description="La solicitud se registra en el mismo repositorio local que consulta Documentos y certificados."
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) form.reset();
        }}
        form={form}
        submitLabel="Enviar solicitud"
        onSubmit={(values) => {
          const kind = values.kind.trim();
          const subject = values.subject.trim();
          if (kind.length < 3) {
            form.setError("kind", { message: "Ingresa el tipo de solicitud." });
            throw new Error("Tipo inválido.");
          }
          if (subject.length < 3) {
            form.setError("subject", { message: "Describe el documento o servicio requerido." });
            throw new Error("Detalle inválido.");
          }
          create({
            id: `SOL-PORTAL-${Date.now()}`,
            kind,
            subject,
            requester: parishioners[0]?.name ?? "Feligrés de muestra",
            requested: "Hoy · demo",
            status: "pending",
            recordVerified: false,
          });
        }}
      >
        <FormSection
          title="Nueva solicitud"
          description="La solicitud se comparte con el repositorio local administrativo."
        >
          <TextInputField control={form.control} name="kind" label="Tipo de solicitud" required />
          <TextInputField
            control={form.control}
            name="subject"
            label="Detalle o documento requerido"
            required
          />
        </FormSection>
      </FormModal>
      <DetailDrawer
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.kind ?? "Seguimiento de solicitud"}
        description={selected?.id}
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Fecha de solicitud">{selected.created}</InfoItem>
              <InfoItem label="Estado">{selected.status}</InfoItem>
              <InfoItem label="Referencia">{selected.id}</InfoItem>
              <InfoItem label="Siguiente paso">
                {selected.step < 3 ? "Revisión de secretaría" : "Consulta en oficina parroquial"}
              </InfoItem>
            </div>
            <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
              {selected.note}
            </p>
            <p className="text-xs text-muted-foreground">
              Solo se muestra el estado de esta solicitud de ejemplo. No se despliegan datos
              sacramentales ni información de terceros.
            </p>
          </div>
        )}
      </DetailDrawer>
    </ModuleLayout>
  );
}
