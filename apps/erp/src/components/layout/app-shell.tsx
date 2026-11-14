import { parishDemo, parishDemoPeople } from "@/data/parish-demo";
import { Link, useRouterState } from "@tanstack/react-router";
import { Check, ChevronDown, ChevronLeft, ChevronRight, LogOut, Menu, Palette, Search, Settings2, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { appModules, moduleGroupIcons, moduleGroups } from "@/data/navigation";
import { useAoCristianoSettings } from "@/lib/use-ao-cristiano";
import { isChristianProfile } from "@/lib/ao-cristiano-profile";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type UserPanel = "profile" | "preferences" | null;
type AppearanceTheme = "blue" | "light";
type PreferencesView = "main" | "appearance";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { settings, canAccessPath } = useAoCristianoSettings();
  const christian = isChristianProfile(settings.profile);
  const terms = settings.terminology;
  const visibleModules = appModules
    .filter((module) => canAccessPath(module.path))
    .map((module) => {
      if (!christian) return module;
      if (module.id === "feligreses-familias") return { ...module, label: `${terms.membersLabel} y familias` };
      if (module.id === "grupos-ministerios") return { ...module, label: "Ministerios, grupos y células" };
      if (module.id === "agenda-infraestructura") return { ...module, label: "Agenda, cultos e infraestructura" };
      if (module.id === "accion-pastoral-social") return { ...module, label: "Acción pastoral, social y acompañamiento" };
      if (module.id === "planificacion-pastoral") return { ...module, label: "Planificación y seguimiento" };
      return module;
    });
  const visibleModuleGroups = [...new Set(visibleModules.map((module) => module.group))].filter((group) => group !== "General");
  const activeModule = visibleModules.find((module) => module.path === pathname) ?? appModules.find((module) => module.path === pathname);
  const activeGroup = activeModule?.group === "General" ? undefined : activeModule?.group;
  const initialActiveGroup = useRef(activeGroup);
  const [open, setOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userPanel, setUserPanel] = useState<UserPanel>(null);
  const [preferencesView, setPreferencesView] = useState<PreferencesView>("main");
  const [theme, setTheme] = useState<AppearanceTheme>("blue");
  const [appearanceLoaded, setAppearanceLoaded] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [demoSessionEnded, setDemoSessionEnded] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => activeGroup ? [activeGroup] : []);
  const [navigationPreferencesLoaded, setNavigationPreferencesLoaded] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    let savedTheme: AppearanceTheme = "blue";
    try {
      savedTheme = window.localStorage.getItem("ao-erp-theme") === "light" ? "light" : "blue";
    } catch {
      // El tema azul queda como valor seguro si el navegador restringe localStorage.
    }
    setTheme(savedTheme);
    document.documentElement.dataset["theme"] = savedTheme;
    setAppearanceLoaded(true);
  }, []);

  useEffect(() => {
    if (!appearanceLoaded) return;
    document.documentElement.dataset["theme"] = theme;
    try {
      window.localStorage.setItem("ao-erp-theme", theme);
    } catch {
      // La apariencia sigue aplicada durante esta sesión aunque no pueda guardarse.
    }
  }, [appearanceLoaded, theme]);

  const applyAppearance = (nextTheme: AppearanceTheme) => {
    document.documentElement.dataset["theme"] = nextTheme;
    setTheme(nextTheme);
    try {
      window.localStorage.setItem("ao-erp-theme", nextTheme);
    } catch {
      // El cambio visual no depende de la persistencia local.
    }
  };

  useEffect(() => {
    const fallbackGroup = initialActiveGroup.current;
    try {
      const saved = window.localStorage.getItem("ao-erp:navigation:expanded-groups:v1");
      if (saved !== null) {
        const parsed: unknown = JSON.parse(saved);
        const restored = Array.isArray(parsed)
          ? parsed.filter((group): group is string => typeof group === "string" && moduleGroups.includes(group))
          : [];
        if (fallbackGroup && !restored.includes(fallbackGroup) && canAccessPath(appModules.find((m) => m.group === fallbackGroup)?.path ?? "/")) restored.push(fallbackGroup);
        setExpandedGroups(restored.length > 0 ? restored : fallbackGroup ? [fallbackGroup] : []);
      } else if (fallbackGroup) {
        setExpandedGroups((current) => (current.includes(fallbackGroup) ? current : [...current, fallbackGroup]));
      }
    } catch {
      if (fallbackGroup) setExpandedGroups((current) => (current.includes(fallbackGroup) ? current : [...current, fallbackGroup]));
    }
    setNavigationPreferencesLoaded(true);
  }, []);

  useEffect(() => {
    if (activeGroup) {
      setExpandedGroups((current) => (current.includes(activeGroup) ? current : [...current, activeGroup]));
    }
  }, [activeGroup]);

  useEffect(() => {
    if (!navigationPreferencesLoaded) return;
    try {
      window.localStorage.setItem("ao-erp:navigation:expanded-groups:v1", JSON.stringify(expandedGroups));
    } catch {
      // El menú sigue funcionando durante esta sesión si el navegador bloquea localStorage.
    }
  }, [expandedGroups, navigationPreferencesLoaded]);

  const toggleGroup = (group: string) => {
    setExpandedGroups((current) => {
      if (current.includes(group)) {
        if (group === activeGroup) return current;
        return current.filter((item) => item !== group);
      }
      return [...current, group];
    });
  };

  return <div className="flex min-h-screen w-full overflow-x-clip bg-background">
    {mobileNavOpen && <button aria-label="Cerrar menú lateral" onClick={() => setMobileNavOpen(false)} className="fixed inset-0 z-30 bg-slate-950/45 md:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex h-screen shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 md:sticky md:top-0 md:translate-x-0 ${open ? "w-80" : "w-20"} ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className={`flex items-center gap-3 px-4 py-5 ${open ? "" : "justify-center"}`}>
        <img src="/favicon.png" alt="A&O ERP" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
        {open && <div className="leading-tight"><div className="text-xl font-extrabold tracking-tight text-sidebar-primary-foreground">A&O ERP</div><div className="text-[10px] font-medium uppercase tracking-[0.15em] text-sidebar-foreground/70">{christian ? "Gestión congregacional" : "Gestión eclesial"}</div></div>}
      </div>
      <nav aria-label="Navegación principal" className="flex-1 space-y-1 overflow-y-auto px-2.5 pb-3 pt-1">
        <ul className="mb-1 space-y-0.5">
          {visibleModules.filter((module) => module.group === "General").map(({ id, label, path, icon: Icon }) => {
            const active = pathname === path;
            return <li key={id}><Link to={path} title={!open ? label : undefined} aria-label={label} aria-current={active ? "page" : undefined} onClick={() => setMobileNavOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] leading-5 transition-colors ${active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"} ${open ? "" : "justify-center px-2"}`}>
              <Icon className="size-5 shrink-0" />
              {open && <span className="min-w-0 flex-1 whitespace-normal">{label}</span>}
            </Link></li>;
          })}
        </ul>
        {visibleModuleGroups.map((group) => {
          const GroupIcon = moduleGroupIcons[group] ?? Settings2;
          const groupExpanded = expandedGroups.includes(group);
          const groupId = `navigation-group-${group.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
          return <section key={group}>
            <button type="button" aria-expanded={groupExpanded} aria-controls={groupId} aria-label={`${groupExpanded ? "Contraer" : "Expandir"} grupo ${group}`} title={!open ? group : group === activeGroup ? "El grupo de la ruta activa permanece abierto" : undefined} onClick={() => toggleGroup(group)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/80 ${open ? "" : "justify-center px-2"}`}>
              <GroupIcon className="size-4 shrink-0" />
              {open ? <><span className="min-w-0 flex-1">{group}</span><ChevronDown className={`size-4 shrink-0 transition-transform duration-200 ${groupExpanded ? "rotate-180" : ""}`} /></> : <><span className="sr-only">{group}</span><ChevronDown className={`size-3.5 shrink-0 transition-transform duration-200 ${groupExpanded ? "rotate-180" : ""}`} /></>}
            </button>
            <div id={groupId} aria-hidden={!groupExpanded} inert={!groupExpanded} className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${groupExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <ul className={`min-h-0 overflow-hidden space-y-0.5 border-sidebar-border ${open ? "ml-3 border-l pl-1" : ""}`}>
                {visibleModules.filter((module) => module.group === group).map(({ id, label, path, icon: Icon }) => {
                  const active = pathname === path;
                  return <li key={id}><Link to={path} title={!open ? label : undefined} aria-label={label} aria-current={active ? "page" : undefined} onClick={() => setMobileNavOpen(false)} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] leading-5 transition-colors ${active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"} ${open ? "" : "justify-center px-2"}`}>
                    <Icon className="size-5 shrink-0" />
                    {open && <span className="min-w-0 flex-1 whitespace-normal">{label}</span>}
                  </Link></li>;
                })}
              </ul>
            </div>
          </section>;
        })}
      </nav>
      <div className={`mt-auto border-t border-sidebar-border p-3 ${open ? "" : "flex justify-center"}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" title={!open ? "José Alberto Díaz · Administrador institucional" : undefined} aria-label="Abrir menú de José Alberto Díaz" className={`group flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring ${open ? "" : "w-12 justify-center p-1.5"}`}>
              <span className="relative shrink-0"><Avatar className="size-10 border border-sidebar-foreground/15"><AvatarFallback className="bg-sidebar-accent text-xs font-bold text-sidebar-primary-foreground">JD</AvatarFallback></Avatar><span aria-label="Disponible · demostración" title="Disponible · demostración" className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-sidebar bg-emerald-400" /></span>
              {open && <span className="min-w-0 flex-1 leading-tight"><span className="block truncate text-sm font-semibold text-sidebar-primary-foreground">José Alberto Díaz</span><span className="mt-1 block truncate text-xs text-sidebar-foreground/70">Administrador institucional</span></span>}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side={open ? "top" : "right"} align={open ? "start" : "center"} sideOffset={8} className="w-64">
            <DropdownMenuLabel className="font-normal"><div className="flex items-center gap-3 py-1"><Avatar className="size-9"><AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">JD</AvatarFallback></Avatar><div className="min-w-0"><p className="truncate text-sm font-semibold">José Alberto Díaz</p><p className="truncate text-xs text-muted-foreground">Administrador institucional</p></div></div></DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setUserPanel("profile")}><UserRound />Mi perfil</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => { setPreferencesView("main"); setUserPanel("preferences"); }}><Settings2 />Preferencias</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setLogoutConfirmOpen(true)} className="text-red-600 focus:bg-red-50 focus:text-red-700"><LogOut />Cerrar sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
    <div className="flex min-h-screen w-0 min-w-0 flex-1 flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b bg-card/90 px-3 py-3 backdrop-blur sm:gap-4 sm:px-6">
        <button onClick={() => isMobile ? setMobileNavOpen((value) => !value) : setOpen((value) => !value)} aria-label={isMobile ? (mobileNavOpen ? "Cerrar menú" : "Abrir menú") : (open ? "Contraer menú" : "Expandir menú")} aria-expanded={isMobile ? mobileNavOpen : open} className="rounded-md p-2 text-primary hover:bg-muted"><Menu className="h-5 w-5" /></button>
        <div className="relative min-w-0 max-w-xl flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input aria-label="Buscar" placeholder="Buscar en A&O ERP..." className="w-full min-w-0 rounded-full border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring" /></div>
      </header>
      <div className="min-w-0 flex-1">{children}</div>
    </div>

    <Sheet open={userPanel !== null} onOpenChange={(nextOpen) => !nextOpen && setUserPanel(null)}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader><SheetTitle>{userPanel === "profile" ? "Mi perfil" : preferencesView === "appearance" ? "Apariencia" : "Preferencias"}</SheetTitle><SheetDescription>{userPanel === "profile" ? "Vista demostrativa del perfil local del prototipo." : preferencesView === "appearance" ? "Elige cómo quieres ver A&O ERP. El cambio se aplica al instante." : "Preferencias locales de visualización del prototipo."}</SheetDescription>{userPanel === "preferences" && preferencesView === "appearance" && <button type="button" onClick={() => setPreferencesView("main")} className="inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"><ChevronLeft className="size-4" />Volver a preferencias</button>}</SheetHeader>
        {userPanel === "profile" ? <div className="space-y-5 px-4 pb-6"><div className="flex items-center gap-4 rounded-xl border bg-muted/30 p-4"><Avatar className="size-14"><AvatarFallback className="bg-primary/10 font-bold text-primary">JD</AvatarFallback></Avatar><div><p className="font-semibold">José Alberto Díaz</p><p className="mt-1 text-sm text-muted-foreground">Administrador institucional</p><span className="mt-2 inline-flex items-center gap-1.5 text-xs text-emerald-700"><span className="size-2 rounded-full bg-emerald-500" />Disponible · demostración</span></div></div><div className="space-y-3 rounded-xl border p-4"><ProfileInfo label="Institución" value={parishDemo.officialName} /><ProfileInfo label="Correo de muestra" value={parishDemoPeople.administrator.email} /><ProfileInfo label="Ámbito" value={`Administración institucional · ${parishDemo.id}`} /><ProfileInfo label="Tipo de cuenta" value="Perfil local de demostración" /></div><p className="text-xs leading-relaxed text-muted-foreground">Este perfil no está asociado a una cuenta autenticada ni a un servicio externo.</p></div> : userPanel === "preferences" ? preferencesView === "appearance" ? <AppearanceSettings theme={theme} onChange={applyAppearance} /> : <div className="space-y-4 px-4 pb-6"><div className="rounded-xl border p-4"><p className="text-sm font-semibold">Preferencias de visualización</p><p className="mt-1 text-xs text-muted-foreground">Valores locales de ejemplo para este prototipo.</p></div><button type="button" onClick={() => setPreferencesView("appearance")} className="flex w-full items-center justify-between gap-4 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-accent/60"><span className="flex min-w-0 items-center gap-3"><span className="rounded-lg bg-secondary p-2.5 text-primary"><Palette className="size-5" /></span><span className="min-w-0"><span className="block text-sm font-semibold">Apariencia</span><span className="mt-1 block text-xs text-muted-foreground">Tema {theme === "blue" ? "Estilo Institucional" : "Estilo Esencial"}</span></span></span><ChevronRight className="size-4 shrink-0 text-muted-foreground" /></button><ProfileInfo label="Idioma" value="Español" /><ProfileInfo label="Formato de fecha" value="DD/MM/AAAA" /><ProfileInfo label="Zona horaria" value="America/Bogota · UTC−05:00" /><p className="text-xs leading-relaxed text-muted-foreground">La configuración institucional completa se organiza en el módulo Configuración.</p></div> : null}
      </SheetContent>
    </Sheet>

    <AlertDialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>¿Finalizar esta demostración?</AlertDialogTitle><AlertDialogDescription>Se mostrará una pantalla de sesión finalizada. No se ejecutará una autenticación real ni se borrarán datos del prototipo.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Seguir en el prototipo</AlertDialogCancel><AlertDialogAction onClick={() => setDemoSessionEnded(true)} className="bg-red-600 text-white hover:bg-red-700">Mostrar cierre demostrativo</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {demoSessionEnded && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F5F7FA] p-6"><div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-xl"><div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#12304A] text-white"><ShieldCheck className="size-7" /></div><p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#B9934B]">A&amp;O ERP · Demostración</p><h1 className="mt-2 text-2xl font-bold text-[#12304A]">Sesión finalizada</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Esta es una pantalla ilustrativa. No se cerró una sesión real y el estado local del prototipo sigue disponible.</p><Button className="mt-6 w-full" onClick={() => setDemoSessionEnded(false)}>Volver al prototipo</Button></div></div>}
  </div>;
}

function AppearanceSettings({ theme, onChange }: { theme: AppearanceTheme; onChange: (theme: AppearanceTheme) => void }) {
  const options: { id: AppearanceTheme; label: string; description: string }[] = [
    { id: "blue", label: "Estilo Institucional", description: "Identidad azul marino con detalles dorados" },
    { id: "light", label: "Estilo Esencial", description: "Interfaz clara con navegación blanca y acentos azules" },
  ];

  return <div className="space-y-4 px-4 pb-6">
    <p className="text-sm leading-relaxed text-muted-foreground">La apariencia se aplica a toda la aplicación y se guarda en este navegador.</p>
    <div role="radiogroup" aria-label="Tema de A&O ERP" className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const selected = theme === option.id;
        const blue = option.id === "blue";
        return <button key={option.id} type="button" role="radio" aria-checked={selected} onClick={() => onChange(option.id)} className={`rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? "border-primary bg-primary/[0.03] ring-2 ring-primary/15" : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"}`}>
          <div aria-hidden="true" className="flex h-20 overflow-hidden rounded-lg border border-border bg-[#F5F7FA]">
            <div className={`w-[31%] shrink-0 space-y-1.5 p-2 ${blue ? "bg-[#12304A]" : "border-r border-[#E4E8EE] bg-white"}`}>
              <div className={`mb-2 h-2 w-7 rounded-sm ${blue ? "bg-white/90" : "bg-[#12304A]"}`} />
              <div className={`h-1.5 w-full rounded-sm ${blue ? "bg-white/25" : "bg-[#52657A]/20"}`} />
              <div className={`h-1.5 w-4/5 rounded-sm ${blue ? "bg-[#244766]" : "bg-[#EAF2FF]"}`} />
              <div className={`h-1.5 w-full rounded-sm ${blue ? "bg-white/25" : "bg-[#52657A]/20"}`} />
            </div>
            <div className="flex-1 space-y-2 p-2.5">
              <div className="h-2 w-1/2 rounded-sm bg-[#12304A]/80" />
              <div className="h-1.5 w-3/4 rounded-sm bg-[#52657A]/25" />
              <div className="grid grid-cols-2 gap-1.5 pt-1"><div className="h-6 rounded-sm border border-[#E4E8EE] bg-white" /><div className="h-6 rounded-sm border border-[#E4E8EE] bg-white" /></div>
            </div>
          </div>
          <span className="mt-3 flex items-start justify-between gap-2">
            <span className="min-w-0"><span className="block text-sm font-semibold text-foreground">{option.label}</span><span className="mt-1 block text-xs leading-4 text-muted-foreground">{option.description}</span></span>
            <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${selected ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background text-transparent"}`}><Check className="size-3.5" /></span>
          </span>
        </button>;
      })}
    </div>
    <p className="text-xs leading-relaxed text-muted-foreground">La preferencia es local por ahora y podrá asociarse al usuario cuando exista autenticación.</p>
  </div>;
}

function ProfileInfo({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 border-b pb-2 last:border-0 last:pb-0"><span className="text-xs text-muted-foreground">{label}</span><span className="text-right text-xs font-medium">{value}</span></div>;
}
