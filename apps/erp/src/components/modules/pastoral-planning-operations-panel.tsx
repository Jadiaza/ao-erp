import { useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { FieldGroup, FormDialog } from "@/components/modules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocalCollection } from "@/data/local-repository";
import { parishGroups, pastoralObjectives, type PastoralObjective } from "@/data/pastoral-demo";
import { institutionalResponsibles } from "@/data/institutional-structure-demo";

export function PastoralPlanningOperationsPanel() {
  const objectivesStore = useLocalCollection("ao-erp:pastoral:objectives", pastoralObjectives);
  const groupsStore = useLocalCollection("ao-erp:pastoral:groups", parishGroups);
  const peopleStore = useLocalCollection(
    "ao-erp:institution:responsibles",
    institutionalResponsibles,
  );
  const [objectiveOpen, setObjectiveOpen] = useState(false);
  const [activityTarget, setActivityTarget] = useState<string | null>(null);
  const [editing, setEditing] = useState<PastoralObjective | null>(null);
  const activities = useMemo(
    () =>
      objectivesStore.records.flatMap((objective) =>
        objective.activities.map((activity, index) => ({
          ...activity,
          id: activity.id ?? `${objective.id}-activity-${index}`,
          objectiveId: objective.id,
        })),
      ),
    [objectivesStore.records],
  );
  const progress = (objective: PastoralObjective) =>
    objective.activities.length
      ? Math.round(
          objective.activities.reduce(
            (total, activity) =>
              total +
              (activity.progress ??
                (activity.status === "approved" ? 100 : activity.status === "active" ? 50 : 0)),
            0,
          ) / objective.activities.length,
        )
      : 0;

  return (
    <section className="space-y-4 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Plan operativo y actividades</h2>
          <p className="text-xs text-muted-foreground">
            Los objetivos, actividades, responsables y grupos se relacionan por identificadores y se
            conservan localmente.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setObjectiveOpen(true);
          }}
        >
          <Plus className="mr-1 size-4" />
          Nuevo objetivo
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {objectivesStore.records.map((objective) => (
          <div key={objective.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {objective.line}
                </p>
                <h3 className="mt-1 font-semibold">{objective.objective}</h3>
              </div>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Editar objetivo"
                onClick={() => {
                  setEditing(objective);
                  setObjectiveOpen(true);
                }}
              >
                <Pencil className="size-4" />
              </Button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <span>Responsable: {objective.lead}</span>
              <span>Actividades: {objective.activities.length}</span>
              <span>Meta: {objective.target}</span>
              <span>Cumplimiento: {progress(objective)}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${progress(objective)}%` }}
              />
            </div>
            <div className="mt-3 space-y-2">
              {objective.activities.map((activity, index) => (
                <div
                  key={activity.id ?? `${objective.id}-${index}`}
                  className="rounded-md bg-muted/40 p-2 text-xs"
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-medium">{activity.name}</span>
                    <span>{activity.progress ?? 0}%</span>
                  </div>
                  <p className="text-muted-foreground">
                    {activity.date} · {activity.status}
                  </p>
                </div>
              ))}
            </div>
            <Button
              className="mt-3"
              size="sm"
              variant="outline"
              onClick={() => setActivityTarget(objective.id)}
            >
              <Plus className="mr-1 size-3.5" />
              Agregar actividad
            </Button>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Actividades registradas: {activities.length}. Los porcentajes se calculan desde las
        actividades; no se agregan cifras externas.
      </p>
      <FormDialog
        key={editing?.id ?? "new-objective"}
        title={editing ? "Editar objetivo pastoral" : "Nuevo objetivo pastoral"}
        description="Define la meta, el indicador y el responsable del objetivo."
        open={objectiveOpen}
        onOpenChange={setObjectiveOpen}
        submitLabel={editing ? "Guardar cambios" : "Crear objetivo"}
        onSubmit={(data) => {
          const objective = String(data.get("objective") ?? "").trim();
          const target = String(data.get("target") ?? "").trim();
          const indicator = String(data.get("indicator") ?? "").trim();
          const responsibleId = String(data.get("lead") ?? "").trim();
          const lead =
            peopleStore.records.find((person) => person.id === responsibleId)?.name ?? "";
          if (objective.length < 4 || target.length < 2 || indicator.length < 2 || lead.length < 2)
            return;
          const record: PastoralObjective = {
            ...(editing ?? {
              id: `OBJ-DEMO-${Date.now()}`,
              line: "Nueva línea pastoral",
              program: "Programa local",
              project: "Proyecto local",
              progress: 0,
              activities: [],
            }),
            objective,
            target,
            indicator,
            lead,
            responsibleId,
          };
          if (editing) objectivesStore.update(editing.id, record);
          else objectivesStore.create(record);
          setEditing(null);
        }}
      >
        <FieldGroup label="Objetivo">
          <Input name="objective" defaultValue={editing?.objective} required />
        </FieldGroup>
        <FieldGroup label="Meta">
          <Input name="target" defaultValue={editing?.target} required />
        </FieldGroup>
        <FieldGroup label="Indicador">
          <Input name="indicator" defaultValue={editing?.indicator} required />
        </FieldGroup>
        <FieldGroup label="Responsable">
          <select
            name="lead"
            defaultValue={editing?.responsibleId ?? peopleStore.records[0]?.id}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            {peopleStore.records.map((person) => (
              <option key={person.id} value={person.name}>
                {person.name} · {person.role}
              </option>
            ))}
          </select>
        </FieldGroup>
      </FormDialog>
      <FormDialog
        title="Nueva actividad"
        description="La actividad se guarda dentro del objetivo seleccionado."
        open={!!activityTarget}
        onOpenChange={(open) => !open && setActivityTarget(null)}
        submitLabel="Guardar actividad"
        onSubmit={(data) => {
          if (!activityTarget) return;
          const name = String(data.get("name") ?? "").trim();
          const date = String(data.get("date") ?? "").trim();
          if (name.length < 3 || !date) return;
          const objective = objectivesStore.records.find((item) => item.id === activityTarget);
          if (!objective) return;
          objectivesStore.update(activityTarget, {
            activities: [
              ...objective.activities,
              {
                id: `ACT-DEMO-${Date.now()}`,
                name,
                date,
                status: "pending",
                progress: 0,
                responsibleId: String(data.get("responsibleId") ?? ""),
                groupId: String(data.get("groupId") ?? ""),
                observation: String(data.get("observation") ?? ""),
              },
            ],
          });
        }}
      >
        <FieldGroup label="Actividad">
          <Input name="name" required />
        </FieldGroup>
        <FieldGroup label="Fecha">
          <Input name="date" type="date" required />
        </FieldGroup>
        <FieldGroup label="Responsable">
          <select
            name="responsibleId"
            defaultValue={peopleStore.records[0]?.id}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            {peopleStore.records.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </FieldGroup>
        <FieldGroup label="Grupo o ministerio">
          <select
            name="groupId"
            defaultValue={groupsStore.records[0]?.id}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            {groupsStore.records.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </FieldGroup>
        <FieldGroup label="Observaciones">
          <Input name="observation" />
        </FieldGroup>
      </FormDialog>
    </section>
  );
}
