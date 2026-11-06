import { useEffect, useState } from "react";
import { initialSaasState, type SaasDomainState } from "./saas-domain";
import type { EcosystemRecord } from "./ecosystem-demo";
import type { SupportArea, SupportRecord } from "./support-demo";

const STORAGE_KEY = "ao-saas:domain:v1";
const CHANGE_EVENT = "ao-saas:domain-change";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isState(value: unknown): value is SaasDomainState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SaasDomainState>;
  return (
    candidate.version === 1 &&
    Array.isArray(candidate.clients) &&
    Array.isArray(candidate.organizations) &&
    Array.isArray(candidate.institutions) &&
    Array.isArray(candidate.users) &&
    Array.isArray(candidate.tickets)
  );
}

class LocalSaasStore {
  private state: SaasDomainState = clone(initialSaasState);
  private loaded = false;
  private readonly listeners = new Set<() => void>();

  private load() {
    if (this.loaded || typeof window === "undefined") return;
    this.loaded = true;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      this.migrateLegacyStorage();
      return;
    }
    try {
      const parsed: unknown = JSON.parse(saved);
      if (isState(parsed)) {
        this.state = {
          ...clone(initialSaasState),
          ...parsed,
          settings: parsed.settings ?? clone(initialSaasState.settings),
        };
      } else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  private migrateLegacyStorage() {
    const readArray = (key: string) => {
      try {
        const value = JSON.parse(window.localStorage.getItem(key) ?? "null");
        return Array.isArray(value) ? value : undefined;
      } catch {
        return undefined;
      }
    };
    const entityKeys: Array<[string, EntityCollectionKey]> = [
      ["ao-saas:organizations", "organizations"],
      ["ao-saas:institutions", "institutions"],
      ["ao-saas:users", "users"],
      ["ao-saas:roles", "roles"],
      ["ao-saas:plans", "plans"],
    ];
    for (const [key, collection] of entityKeys) {
      const rows = readArray(key);
      if (rows) (this.state as unknown as Record<string, unknown>)[collection] = rows;
    }
    const moduleRecords = { ...this.state.moduleRecords };
    for (const path of [
      "clientes",
      "productos-servicios",
      "suscripciones",
      "facturacion-cartera",
      "identidad-seguridad",
      "aprovisionamiento",
      "infraestructura",
      "auditoria-cumplimiento",
      "analitica-reportes",
    ]) {
      const rows = readArray(`ao-saas:${path}`);
      if (rows) moduleRecords[path] = rows;
    }
    const support = { ...this.state.supportRecords };
    for (const area of Object.keys(support) as SupportArea[]) {
      const rows = readArray(`ao-saas:support:${area}`);
      if (rows) support[area] = rows;
    }
    this.state = { ...this.state, moduleRecords, supportRecords: support };
  }

  read(): SaasDomainState {
    this.load();
    return this.state;
  }

  write(next: SaasDomainState) {
    this.state = next;
    this.loaded = true;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // La aplicación permanece operativa en memoria si el navegador bloquea el almacenamiento.
    }
    this.listeners.forEach((listener) => listener());
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    const onStorage = () => listener();
    window.addEventListener(CHANGE_EVENT, onStorage);
    return () => {
      this.listeners.delete(listener);
      window.removeEventListener(CHANGE_EVENT, onStorage);
    };
  }

  reset() {
    this.write(clone(initialSaasState));
  }

  reload() {
    this.loaded = false;
    this.state = clone(initialSaasState);
    return this.read();
  }

  readSettings() {
    return clone(this.read().settings);
  }

  updateSettings(changes: Partial<SaasDomainState["settings"]>) {
    const state = this.read();
    const settings = { ...state.settings, ...changes };
    if (JSON.stringify(settings) === JSON.stringify(state.settings)) return;
    this.write({ ...state, settings });
  }
}

export const saasStore = new LocalSaasStore();
export type EntityCollectionKey = Exclude<
  keyof SaasDomainState,
  "version" | "moduleRecords" | "supportRecords"
>;
export type EntityRow<K extends EntityCollectionKey> =
  SaasDomainState[K] extends Array<infer T> ? T & { id: string } : never;

export class EntityRepository<K extends EntityCollectionKey> {
  constructor(private readonly collection: K) {}

  list(): EntityRow<K>[] {
    return clone(saasStore.read()[this.collection]) as unknown as EntityRow<K>[];
  }

  getById(id: string): EntityRow<K> | undefined {
    return this.list().find((row) => row.id === id);
  }

  create(row: EntityRow<K>): EntityRow<K> {
    const current = saasStore.read();
    const next = {
      ...current,
      [this.collection]: [...(current[this.collection] as unknown as EntityRow<K>[]), row],
    } as SaasDomainState;
    saasStore.write(next);
    return row;
  }

  update(id: string, changes: Partial<EntityRow<K>>): EntityRow<K> | undefined {
    const current = saasStore.read();
    const rows = current[this.collection] as unknown as Array<EntityRow<K>>;
    const found = rows.find((row) => row.id === id);
    if (!found) return undefined;
    const updated = { ...found, ...changes, updatedAt: new Date().toISOString() } as EntityRow<K>;
    const next = {
      ...current,
      [this.collection]: rows.map((row) => (row.id === id ? updated : row)),
    } as SaasDomainState;
    saasStore.write(next);
    return updated;
  }

  delete(id: string): boolean {
    const current = saasStore.read();
    const rows = current[this.collection] as unknown as Array<EntityRow<K>>;
    const nextRows = rows.filter((row) => row.id !== id);
    if (nextRows.length === rows.length) return false;
    saasStore.write({ ...current, [this.collection]: nextRows } as SaasDomainState);
    return true;
  }

  replace(rows: EntityRow<K>[]) {
    const current = saasStore.read();
    saasStore.write({ ...current, [this.collection]: rows } as SaasDomainState);
  }

  search(query: string): EntityRow<K>[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return this.list();
    return this.list().filter((row) => JSON.stringify(row).toLowerCase().includes(normalized));
  }

  filter(predicate: (row: EntityRow<K>) => boolean): EntityRow<K>[] {
    return this.list().filter(predicate);
  }

  subscribe(listener: () => void) {
    return saasStore.subscribe(listener);
  }
}

export const repositories = {
  clients: new EntityRepository("clients"),
  organizations: new EntityRepository("organizations"),
  institutions: new EntityRepository("institutions"),
  contacts: new EntityRepository("contacts"),
  users: new EntityRepository("users"),
  memberships: new EntityRepository("memberships"),
  roles: new EntityRepository("roles"),
  permissions: new EntityRepository("permissions"),
  applications: new EntityRepository("applications"),
  modules: new EntityRepository("modules"),
  features: new EntityRepository("features"),
  plans: new EntityRepository("plans"),
  contracts: new EntityRepository("contracts"),
  subscriptions: new EntityRepository("subscriptions"),
  licenses: new EntityRepository("licenses"),
  entitlements: new EntityRepository("entitlements"),
  usageLimits: new EntityRepository("usageLimits"),
  invoices: new EntityRepository("invoices"),
  payments: new EntityRepository("payments"),
  tickets: new EntityRepository("tickets"),
} as const;

export class SupportRepository {
  constructor(private readonly area: SupportArea) {}

  list(): SupportRecord[] {
    return clone(saasStore.read().supportRecords[this.area]);
  }

  create(record: SupportRecord) {
    const state = saasStore.read();
    saasStore.write({
      ...state,
      supportRecords: { ...state.supportRecords, [this.area]: [...this.list(), record] },
    });
  }

  update(id: string, changes: Partial<SupportRecord>) {
    const state = saasStore.read();
    saasStore.write({
      ...state,
      supportRecords: {
        ...state.supportRecords,
        [this.area]: this.list().map((row) => (row.id === id ? { ...row, ...changes } : row)),
      },
    });
  }

  delete(id: string) {
    const state = saasStore.read();
    saasStore.write({
      ...state,
      supportRecords: {
        ...state.supportRecords,
        [this.area]: this.list().filter((row) => row.id !== id),
      },
    });
  }

  subscribe(listener: () => void) {
    return saasStore.subscribe(listener);
  }
}

export class ModuleRecordRepository {
  constructor(private readonly path: string) {}

  list(): EcosystemRecord[] {
    return clone(saasStore.read().moduleRecords[this.path] ?? []);
  }

  replace(rows: EcosystemRecord[]) {
    const state = saasStore.read();
    saasStore.write({ ...state, moduleRecords: { ...state.moduleRecords, [this.path]: rows } });
  }

  subscribe(listener: () => void) {
    return saasStore.subscribe(listener);
  }
}

export function getModuleRepository(path: string) {
  return new ModuleRecordRepository(path);
}

export function useRepositoryRows<K extends EntityCollectionKey>(repository: EntityRepository<K>) {
  const [rows, setRows] = useState(() => repository.list());
  useEffect(() => {
    const sync = () => setRows(repository.list());
    sync();
    return repository.subscribe(sync);
  }, [repository]);
  return rows;
}

export function useSettings() {
  const [settings, setSettings] = useState(() => saasStore.read().settings);
  useEffect(() => {
    const sync = () => setSettings(saasStore.read().settings);
    sync();
    return saasStore.subscribe(sync);
  }, []);
  return settings;
}

export function useSupportRows(repository: SupportRepository) {
  const [rows, setRows] = useState(() => repository.list());
  useEffect(() => {
    const sync = () => setRows(repository.list());
    sync();
    return repository.subscribe(sync);
  }, [repository]);
  return rows;
}

export function getSupportRepository(area: SupportArea) {
  return new SupportRepository(area);
}
