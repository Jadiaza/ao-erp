import { useMemo, useState } from "react";
import { Bell, BookOpen, Check, Church, CircleHelp, Coins, Globe2, Landmark, Languages, Save, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { DemoNotice, FieldGroup, ModuleLayout, StatusBadge } from "@/components/modules";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { parishDemo } from "@/data/parish-demo";
import { accountingEntities } from "@/data/economy-demo";
import { useAoCristianoSettings } from "@/lib/use-ao-cristiano";
import type { ErpProductProfile, PastoralAccessRole } from "@/lib/ao-cristiano-profile";

const sections = [
  { id: "subscription", title: "Perfil y suscripción (demo)", icon: Church, description: "Paquete A&O Cristiano/Católico, sede y controles de acceso" },
  { id: "general", title: "Datos generales", icon: Landmark, description: "Nombre, jurisdicción e identidad institucional" },
  { id: "regional", title: "Preferencias regionales", icon: Globe2, description: "Idioma, país, moneda y formatos" },
  { id: "accounting", title: "Configuración contable", icon: Coins, description: "Marco y catálogo por entidad" },
  { id: "sacramental", title: "Parámetros sacramentales", icon: BookOpen, description: "Referencias y criterios de consulta" },
  { id: "documents", title: "Numeración documental", icon: SlidersHorizontal, description: "Series, prefijos y clasificación" },
  { id: "notifications", title: "Notificaciones", icon: Bell, description: "Preferencias de aviso" },
];

export function SettingsCenterScreen() {
  const { settings, updateSettings } = useAoCristianoSettings();
  const [section, setSection] = useState("subscription");
  const [savedPreview, setSavedPreview] = useState(false);
  const active = sections.find((item) => item.id === section)!;
  const HeaderIcon = active.icon;
  const terms = settings.terminology;

  const setTerm = (key: keyof typeof terms, value: string) =>
    updateSettings({ terminology: { ...terms, [key]: value } });

  return (
    <ModuleLayout
      breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Sistema" }, { label: "Configuración" }]}
      title="Configuración"
      description="Preferencias institucionales, perfil de producto y controles demostrativos de suscripción/entitlements locales."
      actions={<Button className="gap-2" onClick={() => setSavedPreview(true)}><Save className="size-4" />Aplicar cambios locales</Button>}
    >
      <DemoNotice>Configuración en modo demostrativo local (navegador). Estos selectores simulan contexto visual de perfil/sede/rol únicamente para demostración; no equivalen a autenticación real, seguridad de servidor ni control productivo de producción. Al desactivar el paquete cristiano se bloquea acceso funcional en interfaz sin eliminar datos locales.</DemoNotice>
      <div className="grid gap-5 xl:grid-cols-[270px_minmax(0,1fr)]">
        <Card className="h-fit shadow-none">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Categorías de configuración</CardTitle><p className="text-xs text-muted-foreground">Elige un ámbito institucional.</p></CardHeader>
          <CardContent className="space-y-1 p-3 pt-0">
            {sections.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} onClick={() => { setSection(item.id); setSavedPreview(false); }} className={`flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left ${section === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50"}`}>
                  <Icon className="mt-0.5 size-4 shrink-0" />
                  <span>
                    <span className="block text-xs font-semibold">{item.title}</span>
                    <span className={`mt-1 block text-[10px] ${section === item.id ? "text-primary-foreground/75" : "text-muted-foreground"}`}>{item.description}</span>
                  </span>
                </button>
              );
            })}
            <div className="mt-4 flex items-start gap-2 rounded-lg border p-3 text-[10px] leading-relaxed text-muted-foreground"><CircleHelp className="mt-0.5 size-3.5 shrink-0" />Las opciones aplicables pueden depender del país, tipo de entidad y perfil/paquete contratado.</div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card className="shadow-none">
            <CardHeader className="border-b bg-muted/10">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/5 text-primary"><HeaderIcon className="size-5" /></span>
                  <div><CardTitle className="text-base">{active.title}</CardTitle><p className="mt-1 text-xs text-muted-foreground">{active.description}</p></div>
                </div>
                <StatusBadge status="draft" label="Configuración local" />
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              {section === "subscription" && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldGroup label="Perfil / paquete ERP (demo)">
                      <Select value={settings.profile} onValueChange={(v) => updateSettings({ profile: v as ErpProductProfile })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="catolico">A&O Católico</SelectItem>
                          <SelectItem value="cristiano">A&O Cristiano</SelectItem>
                          <SelectItem value="combinado">Cristiano + Católico (plan combinado)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FieldGroup>
                    <FieldGroup label="Rol pastoral (acceso confidencial)">
                      <Select value={settings.pastoralAccessRole} onValueChange={(v) => updateSettings({ pastoralAccessRole: v as PastoralAccessRole })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pastor_principal">Pastor principal (autorizado)</SelectItem>
                          <SelectItem value="lider_pastoral">Líder pastoral (autorizado)</SelectItem>
                          <SelectItem value="consejero_autorizado">Consejero autorizado</SelectItem>
                          <SelectItem value="administracion">Administración (sin acceso confidencial)</SelectItem>
                          <SelectItem value="solo_lectura">Solo lectura (sin acceso confidencial)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FieldGroup>
                    <FieldGroup label="Organización (aislamiento multiinstitución)">
                      <Input value={settings.organizationId} onChange={(e) => updateSettings({ organizationId: e.target.value })} />
                    </FieldGroup>
                    <FieldGroup label="Sede / congregación">
                      <Input value={settings.campusId} onChange={(e) => updateSettings({ campusId: e.target.value })} />
                    </FieldGroup>
                  </div>
                  <div className="space-y-3 rounded-lg border p-4">
                    <p className="text-sm font-semibold">Terminología cristiana configurable</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <FieldGroup label="Institución / iglesia"><Input value={terms.institutionLabel} onChange={(e) => setTerm("institutionLabel", e.target.value)} /></FieldGroup>
                      <FieldGroup label="Sede"><Input value={terms.campusLabel} onChange={(e) => setTerm("campusLabel", e.target.value)} /></FieldGroup>
                      <FieldGroup label="Miembro (singular)"><Input value={terms.memberLabel} onChange={(e) => setTerm("memberLabel", e.target.value)} /></FieldGroup>
                      <FieldGroup label="Miembros (plural)"><Input value={terms.membersLabel} onChange={(e) => setTerm("membersLabel", e.target.value)} /></FieldGroup>
                      <FieldGroup label="Culto / celebración"><Input value={terms.celebrationLabel} onChange={(e) => setTerm("celebrationLabel", e.target.value)} /></FieldGroup>
                      <FieldGroup label="Líder / responsable"><Input value={terms.leaderLabel} onChange={(e) => setTerm("leaderLabel", e.target.value)} /></FieldGroup>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                    <div>
                      <p className="text-sm font-medium">Análisis IA sobre información pastoral sensible</p>
                      <p className="mt-1 text-xs text-muted-foreground">Desactivado por defecto. Requiere autorización expresa; no aplica a notas/confidenciales sin permiso.</p>
                    </div>
                    <Switch checked={settings.allowPastoralAiAnalysis} onCheckedChange={(v) => updateSettings({ allowPastoralAiAnalysis: !!v })} aria-label="Autorizar análisis IA sobre información pastoral sensible" />
                  </div>
                  <div className="rounded-lg border border-primary/15 bg-primary/[0.03] p-4 text-xs text-muted-foreground space-y-1">
                    <p><strong>Control de acceso:</strong> el perfil cristiano bloquea rutas católico-exclusivas (sacramentos, libros sacramentales, certificados sacramentales, estructura eclesiástica, informe anual parroquial, gestión diocesana, liturgia y catequesis católica). El perfil católico bloquea acompañamiento pastoral del paquete cristiano. El perfil combinado permite coexistencia.</p>
                    <p><strong>Datos:</strong> desactivar un paquete bloquea acceso funcional; no elimina ni destruye información histórica (persistencia local demo).</p>
                  </div>
                </>
              )}

              {section === "general" && (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldGroup label="Nombre de la entidad"><Input defaultValue={parishDemo.officialName} /></FieldGroup>
                    <FieldGroup label="Tipo de entidad"><Select defaultValue="congregacion"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="congregacion">Congregación / iglesia</SelectItem><SelectItem value="parroquia">Parroquia</SelectItem><SelectItem value="jurisdiccion">Jurisdicción eclesiástica</SelectItem><SelectItem value="organizacion">Organización vinculada</SelectItem></SelectContent></Select></FieldGroup>
                    <FieldGroup label="Jurisdicción / denominación (opcional)"><Input defaultValue={parishDemo.jurisdictionName} placeholder="Independiente, sin denominación, o referencia" /></FieldGroup>
                    <FieldGroup label="Responsable institucional"><Input defaultValue="Responsable institucional de muestra" /></FieldGroup>
                    <FieldGroup label="Identificador local"><Input defaultValue={parishDemo.id} /></FieldGroup>
                    <FieldGroup label="País de registro"><Select defaultValue="CO"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="CO">Colombia · valor de muestra</SelectItem><SelectItem value="MX">México</SelectItem><SelectItem value="PE">Perú</SelectItem><SelectItem value="other">Otro país</SelectItem></SelectContent></Select></FieldGroup>
                  </div>
                </div>
              )}

              {section === "regional" && (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldGroup label="Idioma de interfaz"><Select defaultValue="es"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="es">Español</SelectItem><SelectItem value="pt">Português</SelectItem><SelectItem value="en">English</SelectItem></SelectContent></Select></FieldGroup>
                    <FieldGroup label="País"><Select defaultValue="CO"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="CO">Colombia</SelectItem><SelectItem value="MX">México</SelectItem><SelectItem value="PE">Perú</SelectItem><SelectItem value="CL">Chile</SelectItem><SelectItem value="other">Configurar otro país</SelectItem></SelectContent></Select></FieldGroup>
                    <FieldGroup label="Moneda"><Select defaultValue="COP"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="COP">COP · Peso colombiano</SelectItem><SelectItem value="MXN">MXN · Peso mexicano</SelectItem><SelectItem value="PEN">PEN · Sol peruano</SelectItem><SelectItem value="custom">Otra moneda</SelectItem></SelectContent></Select></FieldGroup>
                    <FieldGroup label="Zona horaria"><Select defaultValue="Bogota"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Bogota">America/Bogota · UTC-05:00</SelectItem><SelectItem value="Mexico">America/Mexico_City</SelectItem><SelectItem value="Lima">America/Lima</SelectItem><SelectItem value="custom">Seleccionar zona</SelectItem></SelectContent></Select></FieldGroup>
                    <FieldGroup label="Formato de fecha"><Select defaultValue="dmy"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="dmy">DD/MM/AAAA</SelectItem><SelectItem value="mdy">MM/DD/AAAA</SelectItem><SelectItem value="ymd">AAAA-MM-DD</SelectItem></SelectContent></Select></FieldGroup>
                    <FieldGroup label="Formato de número"><Select defaultValue="local"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="local">1.234.567,89 · regional</SelectItem><SelectItem value="international">1,234,567.89 · internacional</SelectItem></SelectContent></Select></FieldGroup>
                  </div>
                </div>
              )}

              {section === "accounting" && (
                <div className="space-y-5">
                  <div className="rounded-lg border border-primary/15 bg-primary/[0.03] p-4"><p className="text-sm font-semibold">Marco contable por entidad</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">A&O ERP no impone un catálogo universal. La jurisdicción, país y entidad definen las opciones contables aplicables.</p></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldGroup label="Entidad contable"><Select defaultValue={parishDemo.accountingEntityId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{accountingEntities.map((entity) => <SelectItem key={entity.id} value={entity.id}>{entity.name}</SelectItem>)}</SelectContent></Select></FieldGroup>
                    <FieldGroup label="País / jurisdicción contable"><Select defaultValue="CO"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="CO">Colombia · configurable</SelectItem><SelectItem value="other">Otro marco jurisdiccional</SelectItem></SelectContent></Select></FieldGroup>
                    <FieldGroup label="Marco o plan de cuentas"><Select defaultValue="local"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="local">Plan institucional configurado localmente</SelectItem><SelectItem value="reference">Catálogo de referencia configurable</SelectItem><SelectItem value="custom">Definido por entidad</SelectItem></SelectContent></Select></FieldGroup>
                    <FieldGroup label="Periodo fiscal"><Select defaultValue="calendar"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="calendar">Año calendario</SelectItem><SelectItem value="custom">Periodo fiscal personalizado</SelectItem></SelectContent></Select></FieldGroup>
                  </div>
                </div>
              )}

              {section === "sacramental" && (
                <div className="space-y-5">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="flex items-center gap-2 text-sm font-semibold text-amber-900"><ShieldCheck className="size-4" />Parámetros de acceso y registro</p><p className="mt-1 text-xs leading-relaxed text-amber-900">Las preferencias describen organización documental y consulta. No amplían permisos ni permiten búsquedas indiscriminadas. En perfil exclusivamente cristiano, los módulos sacramentales católicos permanecen bloqueados por suscripción.</p></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldGroup label="Jurisdicción de referencia"><Input defaultValue={parishDemo.jurisdictionName} /></FieldGroup>
                    <FieldGroup label="Estructura de libro"><Select defaultValue="configurable"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="configurable">Configurable por jurisdicción</SelectItem><SelectItem value="local">Serie local de la entidad</SelectItem></SelectContent></Select></FieldGroup>
                    <FieldGroup label="Responsable de custodia"><Input defaultValue="Custodia documental institucional" /></FieldGroup>
                    <FieldGroup label="Política de consulta"><Select defaultValue="justified"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="justified">Consulta justificada y autorizada</SelectItem><SelectItem value="restricted">Acceso restringido por defecto</SelectItem></SelectContent></Select></FieldGroup>
                  </div>
                </div>
              )}

              {section === "documents" && (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldGroup label="Prefijo de documentos"><Input defaultValue="PAR-SMC" /></FieldGroup>
                    <FieldGroup label="Serie anual"><Input defaultValue="2026" /></FieldGroup>
                    <FieldGroup label="Secuencia de ejemplo"><Input defaultValue="0001" /></FieldGroup>
                    <FieldGroup label="Clasificación predeterminada"><Select defaultValue="internal"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="public">Institucional</SelectItem><SelectItem value="internal">Interno</SelectItem><SelectItem value="restricted">Restringido</SelectItem></SelectContent></Select></FieldGroup>
                    <FieldGroup label="Categoría documental"><Select defaultValue="institutional"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="institutional">Institucional</SelectItem><SelectItem value="pastoral">Pastoral</SelectItem><SelectItem value="administrative">Administrativa</SelectItem><SelectItem value="accounting">Contable</SelectItem><SelectItem value="legal">Jurídica</SelectItem></SelectContent></Select></FieldGroup>
                    <FieldGroup label="Periodo de retención"><Select defaultValue="local"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="local">Definido por política local</SelectItem><SelectItem value="jurisdiction">Definido por jurisdicción</SelectItem></SelectContent></Select></FieldGroup>
                  </div>
                </div>
              )}

              {section === "notifications" && (
                <div className="space-y-2">
                  {[{ title: "Avisos dentro de la aplicación", detail: "Mostrar recordatorios visuales locales", enabled: true }, { title: "Resumen de actividad", detail: "Preferencia de resumen para la entidad", enabled: true }, { title: "Avisos de vencimientos", detail: "Alertas de seguimiento administrativo", enabled: false }, { title: "Comunicaciones comunitarias", detail: "Preferencias de visualización en el portal", enabled: true }].map((item) => (
                    <div key={item.title} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                      <div><p className="text-sm font-medium">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.detail}</p></div>
                      <Switch defaultChecked={item.enabled} aria-label={item.title} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          {savedPreview && <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800"><Check className="size-4" />Cambios aplicados localmente en esta sesión/navegador (modo demostrativo).</div>}
          <div className="flex justify-end"><Button variant="outline" onClick={() => setSavedPreview(true)}><Languages className="mr-2 size-4" />Confirmar vista local</Button></div>
        </div>
      </div>
    </ModuleLayout>
  );
}