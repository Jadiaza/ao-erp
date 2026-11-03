import { appModules } from "@/data/navigation";

export function ModulePlaceholder({ moduleId }: { moduleId: string }) {
  const module = appModules.find((item) => item.id === moduleId);
  if (!module) return null;

  const Icon = module.icon;

  return <main className="mx-auto w-full max-w-5xl space-y-6 p-6">
    <header className="rounded-2xl border bg-card p-8">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary"><Icon className="h-6 w-6" /></div>
        <div><p className="text-sm font-medium text-muted-foreground">A&amp;O ERP · {module.group}</p><h1 className="text-2xl font-bold">{module.label}</h1></div>
      </div>
      <p className="mt-5 max-w-2xl text-muted-foreground">Espacio de trabajo para el módulo de {module.label.toLocaleLowerCase("es")}.</p>
      <div className="mt-6 rounded-xl border border-dashed bg-muted/40 p-6 text-sm text-muted-foreground">La pantalla demostrativa de este módulo se desarrollará en la siguiente etapa.</div>
    </header>
  </main>;
}
