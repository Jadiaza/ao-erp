import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { CalendarDays, CircleDot, Plus, Users, UsersRound } from "lucide-react";
import {
  ActivityTimeline,
  DemoNotice,
  DetailDrawer,
  FilterBar,
  InfoItem,
  ModuleLayout,
  SearchInput,
  StatCard,
  StatusBadge,
} from "@/components/modules";
import { FormModal, FormSection, TextInputField } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parishGroups, type ParishGroupDemo } from "@/data/pastoral-demo";
import { useLocalCollection } from "@/data/local-repository";

const groupTypes = [...new Set(parishGroups.map((group) => group.kind))];
type GroupFormValues = { name: string; coordinator: string };

export function GroupsScreen() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [selected, setSelected] = useState<ParishGroupDemo | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const form = useForm<GroupFormValues>({
    defaultValues: { name: "", coordinator: "" },
    mode: "onBlur",
  });
  const { records, create } = useLocalCollection("ao-erp:pastoral:groups", parishGroups);
  const visible = useMemo(
    () =>
      records.filter(
        (group) =>
          `${group.name} ${group.kind} ${group.coordinator}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (kind === "all" || group.kind === kind),
      ),
    [records, query, kind],
  );

  return (
    <ModuleLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Comunidad y pastoral" },
        { label: "Grupos, movimientos y ministerios" },
      ]}
      title="Grupos, movimientos y ministerios"
      description="Directorio comunitario de grupos, comunidades y equipos de servicio parroquial."
      actions={
        <Button className="gap-2" onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          Registrar grupo
        </Button>
      }
      stats={
        <>
          <StatCard
            label="Comunidades y grupos"
            value={String(records.length)}
            icon={UsersRound}
            caption="Directorio local"
          />
          <StatCard
            label="Integrantes"
            value="364"
            icon={Users}
            caption="Cifras agregadas ficticias"
          />
          <StatCard label="Ministerios" value="7" caption="Equipos de servicio litúrgico" />
          <StatCard
            label="Actividades este mes"
            value="19"
            icon={CalendarDays}
            caption="Agenda demostrativa"
          />
        </>
      }
    >
      <DemoNotice>
        Coordinadores e integrantes son referencias ficticias. Las cifras reflejan ejemplos locales
        y no una estructura parroquial real.
      </DemoNotice>
      <FilterBar label="Directorio">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Buscar grupo, tipo o coordinador"
          className="w-full sm:w-80"
        />
        <Select value={kind} onValueChange={setKind}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Tipo de comunidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {groupTypes.map((groupType) => (
              <SelectItem key={groupType} value={groupType}>
                {groupType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((group) => (
          <button
            key={group.id}
            onClick={() => setSelected(group)}
            className="group rounded-xl border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-primary">
                  {group.kind}
                </span>
                <h2 className="mt-3 font-semibold tracking-tight">{group.name}</h2>
              </div>
              <UsersRound className="mt-1 size-5 shrink-0 text-primary" />
            </div>
            <p className="mt-2 min-h-10 text-sm leading-relaxed text-muted-foreground">
              {group.purpose}
            </p>
            <div className="mt-4 flex items-center justify-between border-t pt-4 text-xs">
              <span className="text-muted-foreground">Responsable</span>
              <span className="font-medium">{group.coordinator}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Integrantes</span>
              <span className="font-semibold">{group.members}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <CircleDot className="size-3.5" />
                Participación
              </span>
              <span className="text-xs font-semibold">{group.participation}%</span>
            </div>
            <Progress value={group.participation} className="mt-2" />
            <div className="mt-4 flex items-center justify-between">
              <StatusBadge status={group.status} />
              <span className="text-xs text-primary">Abrir ficha →</span>
            </div>
          </button>
        ))}
      </div>
      {visible.length === 0 && (
        <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No hay grupos que coincidan con los filtros.
        </p>
      )}
      <FormModal
        title="Registrar grupo"
        description="Crea un grupo local y lo incorpora al directorio principal."
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) form.reset();
        }}
        form={form}
        submitLabel="Registrar grupo"
        onSubmit={(values) => {
          const name = values.name.trim();
          const coordinator = values.coordinator.trim();
          if (name.length < 3) {
            form.setError("name", { message: "Ingresa al menos 3 caracteres." });
            throw new Error("Nombre inválido.");
          }
          if (coordinator.length < 2) {
            form.setError("coordinator", { message: "Ingresa el responsable." });
            throw new Error("Responsable inválido.");
          }
          create({
            id: `GRP-DEMO-${Date.now()}`,
            name,
            kind: "Grupo parroquial",
            coordinator,
            members: 0,
            schedule: "Por definir",
            nextActivity: "Por programar",
            participation: 0,
            status: "pending",
            purpose: "Grupo creado en modo demostración.",
            activities: [],
          });
        }}
      >
        <FormSection
          title="Datos del grupo"
          description="Registra la comunidad en el directorio local."
        >
          <TextInputField
            control={form.control}
            name="name"
            label="Nombre"
            required
            placeholder="Nombre del grupo"
          />
          <TextInputField
            control={form.control}
            name="coordinator"
            label="Responsable"
            required
            placeholder="Nombre del responsable"
          />
        </FormSection>
      </FormModal>
      <DetailDrawer
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.name ?? "Ficha de grupo"}
        description={selected ? `${selected.kind} · ${selected.id}` : undefined}
      >
        {selected && (
          <div className="space-y-5">
            <div className="rounded-xl bg-secondary/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Propósito comunitario
              </p>
              <p className="mt-2 text-sm leading-relaxed">{selected.purpose}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Tipo">{selected.kind}</InfoItem>
              <InfoItem label="Estado">
                <StatusBadge status={selected.status} />
              </InfoItem>
              <InfoItem label="Coordinación">{selected.coordinator}</InfoItem>
              <InfoItem label="Integrantes">{selected.members}</InfoItem>
              <InfoItem label="Reunión habitual">{selected.schedule}</InfoItem>
              <InfoItem label="Próxima actividad">{selected.nextActivity}</InfoItem>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <h3 className="font-semibold">Participación reciente</h3>
                <span>{selected.participation}%</span>
              </div>
              <Progress value={selected.participation} />
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold">Integrantes de muestra</h3>
              <div className="space-y-2">
                {Array.from({ length: Math.min(4, selected.members) }, (_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <span>Integrante de muestra {String(index + 1).padStart(2, "0")}</span>
                    <span className="text-xs text-muted-foreground">
                      {index === 0 ? "Coordinación" : "Integrante"}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Vista de ejemplo; el directorio completo no se despliega automáticamente.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold">Reuniones y actividades</h3>
              <ActivityTimeline
                entries={selected.activities.map((activity, index) => ({
                  id: `${selected.id}-${index}`,
                  title: activity,
                  description:
                    index === 0 ? selected.nextActivity : "Actividad comunitaria de referencia",
                  date: index === 0 ? selected.schedule : "Oct. 2026",
                  actor: selected.coordinator,
                }))}
              />
            </div>
          </div>
        )}
      </DetailDrawer>
    </ModuleLayout>
  );
}
