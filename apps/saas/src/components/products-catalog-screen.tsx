import { useState, type FormEvent } from "react";
import {
  PRODUCT_AVAILABILITY,
  PRODUCT_CATEGORIES,
  ORGANIZATION_TYPES,
  type Application,
  type EntityStatus,
  type Feature,
  type Module,
} from "../data/saas-domain";
import { resolveModuleDependencies } from "../data/commercial-service";
import {
  getModuleRepository,
  repositories,
  saasStore,
  useRepositoryRows,
} from "../data/saas-repository";
import { SaasIcon } from "./saas-icons";
import {
  EmptyState,
  FilterToolbar,
  MasterFormModal,
  MasterFormSection,
  StatusBadge,
  SummaryCard,
  TableActionIconButton,
  TableRowActions,
} from "./saas-ui";

type CatalogView = "products" | "modules" | "features";

export function ProductsCatalogScreen() {
  const applications = useRepositoryRows(repositories.applications);
  const modules = useRepositoryRows(repositories.modules);
  const features = useRepositoryRows(repositories.features);
  const plans = useRepositoryRows(repositories.plans);

  const [view, setView] = useState<CatalogView>("products");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [categoryFilter, setCategoryFilter] = useState("Todos");

  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    applications[0]?.id ?? null,
  );
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(modules[0]?.id ?? null);

  // Modal de Producto
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Application | null>(null);
  const [prodId, setProdId] = useState("");
  const [prodCode, setProdCode] = useState("");
  const [prodName, setProdName] = useState("");
  const [prodCategory, setProdCategory] = useState<string>(PRODUCT_CATEGORIES[0]);
  const [prodVersion, setProdVersion] = useState("2026.2 Enterprise");
  const [prodAvailability, setProdAvailability] = useState<string>(PRODUCT_AVAILABILITY[0]);
  const [prodStatus, setProdStatus] = useState<EntityStatus>("Activo");
  const [prodDescription, setProdDescription] = useState("");
  const [prodTargets, setProdTargets] = useState("Parroquia, Diócesis, Congregación, Colegio");
  const [formError, setFormError] = useState("");

  // Modal de Módulo
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [modId, setModId] = useState("");
  const [modCode, setModCode] = useState("");
  const [modAppId, setModAppId] = useState(applications[0]?.id ?? "APP-ERP");
  const [modName, setModName] = useState("");
  const [modCategory, setModCategory] = useState("Operación Pastoral y Administrativa");
  const [modAvailability, setModAvailability] = useState("Incluido en base");
  const [modStatus, setModStatus] = useState<EntityStatus>("Activo");
  const [modDescription, setModDescription] = useState("");
  const [modRequiredIds, setModRequiredIds] = useState<string[]>([]);

  // Modal de Funcionalidad
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [featId, setFeatId] = useState("");
  const [featCode, setFeatCode] = useState("");
  const [featModuleId, setFeatModuleId] = useState(modules[0]?.id ?? "MOD-COM");
  const [featName, setFeatName] = useState("");
  const [featAvailability, setFeatAvailability] = useState<string>(PRODUCT_AVAILABILITY[0]);
  const [featStatus, setFeatStatus] = useState<EntityStatus>("Activo");
  const [featDescription, setFeatDescription] = useState("");

  const syncEcosystemModule = () => {
    const repo = getModuleRepository("productos-servicios");
    repo.replace(
      repositories.applications.list().map((app) => ({
        id: app.id,
        name: app.name,
        detail: `${app.code ?? app.id} · v${app.commercialVersion ?? "2026.1"} · ${app.moduleIds.length} módulos`,
        context: app.category ?? "Plataforma SaaS",
        owner: "Arquitectura de Producto",
        status: app.status === "Activo" ? "Activo" : "Pendiente",
      })),
    );
  };

  const filteredProducts = applications.filter((app) => {
    const matchesStatus = statusFilter === "Todos" || app.status === statusFilter;
    const matchesCat =
      categoryFilter === "Todos" || (app.category ?? PRODUCT_CATEGORIES[0]) === categoryFilter;
    const text = [
      app.id,
      app.code,
      app.name,
      app.description,
      app.category,
      app.commercialVersion,
      app.commercialAvailability,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return matchesStatus && matchesCat && text.includes(query.trim().toLowerCase());
  });

  const filteredModules = modules.filter((mod) => {
    const matchesStatus = statusFilter === "Todos" || mod.status === statusFilter;
    const app = applications.find((a) => a.id === mod.applicationId);
    const text = [mod.id, mod.code, mod.name, mod.description, mod.category, app?.name]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return matchesStatus && text.includes(query.trim().toLowerCase());
  });

  const filteredFeatures = features.filter((feat) => {
    const matchesStatus = statusFilter === "Todos" || feat.status === statusFilter;
    const mod = modules.find((m) => m.id === feat.moduleId);
    const text = [feat.id, feat.code, feat.name, feat.description, mod?.name]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return matchesStatus && text.includes(query.trim().toLowerCase());
  });

  const selectedProduct =
    applications.find((item) => item.id === selectedProductId) ?? applications[0] ?? null;
  const selectedModule = modules.find((item) => item.id === selectedModuleId) ?? modules[0] ?? null;

  const openCreateProduct = () => {
    setEditingProduct(null);
    const nextNum = applications.length + 1;
    setProdId(`APP-0${nextNum}`);
    setProdCode(`PROD-AO-0${nextNum}`);
    setProdName("");
    setProdCategory(PRODUCT_CATEGORIES[0]);
    setProdVersion("2026.1");
    setProdAvailability(PRODUCT_AVAILABILITY[0]);
    setProdStatus("Activo");
    setProdDescription("");
    setProdTargets(ORGANIZATION_TYPES.slice(0, 6).join(", "));
    setFormError("");
    setProductModalOpen(true);
  };

  const openEditProduct = (app: Application) => {
    setEditingProduct(app);
    setProdId(app.id);
    setProdCode(app.code ?? app.id);
    setProdName(app.name);
    setProdCategory(app.category ?? PRODUCT_CATEGORIES[0]);
    setProdVersion(app.commercialVersion ?? "2026.1");
    setProdAvailability(app.commercialAvailability ?? PRODUCT_AVAILABILITY[0]);
    setProdStatus(app.status);
    setProdDescription(app.description);
    setProdTargets((app.targetEntities ?? ["Parroquia", "Diócesis"]).join(", "));
    setFormError("");
    setProductModalOpen(true);
  };

  const saveProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prodId.trim() || !prodName.trim() || !prodDescription.trim()) {
      setFormError("Completa el código identificador, el nombre del producto y su descripción.");
      return;
    }
    const now = new Date().toISOString();
    const linkedModules = modules.filter((m) => m.applicationId === prodId.trim()).map((m) => m.id);
    const payload: Application = {
      id: prodId.trim(),
      code: prodCode.trim() || prodId.trim(),
      name: prodName.trim(),
      description: prodDescription.trim(),
      category: prodCategory,
      commercialVersion: prodVersion.trim() || "2026.1",
      commercialAvailability: prodAvailability,
      targetEntities: prodTargets
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      moduleIds: editingProduct?.moduleIds ?? linkedModules,
      status: prodStatus,
      createdAt: editingProduct?.createdAt ?? now,
      updatedAt: now,
    };

    if (editingProduct) {
      repositories.applications.update(editingProduct.id, payload);
    } else {
      repositories.applications.create(payload);
    }
    syncEcosystemModule();
    setSelectedProductId(payload.id);
    setProductModalOpen(false);
  };

  const openCreateModule = () => {
    setEditingModule(null);
    const nextNum = modules.length + 1;
    setModId(`MOD-0${nextNum}`);
    setModCode(`ERP-MOD-0${nextNum}`);
    setModAppId(selectedProduct?.id ?? applications[0]?.id ?? "APP-ERP");
    setModName("");
    setModCategory("Operación Pastoral y Administrativa");
    setModAvailability("Incluido en base");
    setModStatus("Activo");
    setModDescription("");
    setModRequiredIds([]);
    setFormError("");
    setModuleModalOpen(true);
  };

  const openEditModule = (mod: Module) => {
    setEditingModule(mod);
    setModId(mod.id);
    setModCode(mod.code ?? mod.id);
    setModAppId(mod.applicationId);
    setModName(mod.name);
    setModCategory(mod.category ?? "Operación Pastoral");
    setModAvailability(mod.commercialAvailability ?? "Incluido en base");
    setModStatus(mod.status);
    setModDescription(mod.description ?? "");
    setModRequiredIds(mod.requiredModuleIds ?? []);
    setFormError("");
    setModuleModalOpen(true);
  };

  const saveModule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!modId.trim() || !modName.trim()) {
      setFormError("Completa el código y el nombre del módulo funcional.");
      return;
    }
    const now = new Date().toISOString();
    const linkedFeatures = features.filter((f) => f.moduleId === modId.trim()).map((f) => f.id);
    const payload: Module = {
      id: modId.trim(),
      code: modCode.trim() || modId.trim(),
      applicationId: modAppId,
      name: modName.trim(),
      description: modDescription.trim(),
      category: modCategory.trim(),
      requiredModuleIds: modRequiredIds.filter((id) => id !== modId.trim()),
      commercialAvailability: modAvailability,
      featureIds: editingModule?.featureIds ?? linkedFeatures,
      status: modStatus,
      createdAt: editingModule?.createdAt ?? now,
      updatedAt: now,
    };

    if (editingModule) {
      repositories.modules.update(editingModule.id, payload);
    } else {
      repositories.modules.create(payload);
    }

    const parentApp = repositories.applications.getById(modAppId);
    if (parentApp && !parentApp.moduleIds.includes(payload.id)) {
      repositories.applications.update(parentApp.id, {
        moduleIds: [...parentApp.moduleIds, payload.id],
      });
    }
    syncEcosystemModule();
    setSelectedModuleId(payload.id);
    setModuleModalOpen(false);
  };

  const openCreateFeature = () => {
    setEditingFeature(null);
    const nextNum = features.length + 1;
    setFeatId(`FT-0${nextNum}`);
    setFeatCode(`FT-CAP-0${nextNum}`);
    setFeatModuleId(selectedModule?.id ?? modules[0]?.id ?? "MOD-COM");
    setFeatName("");
    setFeatAvailability(PRODUCT_AVAILABILITY[0]);
    setFeatStatus("Activo");
    setFeatDescription("");
    setFormError("");
    setFeatureModalOpen(true);
  };

  const openEditFeature = (feat: Feature) => {
    setEditingFeature(feat);
    setFeatId(feat.id);
    setFeatCode(feat.code ?? feat.id);
    setFeatModuleId(feat.moduleId);
    setFeatName(feat.name);
    setFeatAvailability(feat.commercialAvailability ?? PRODUCT_AVAILABILITY[0]);
    setFeatStatus(feat.status);
    setFeatDescription(feat.description ?? "");
    setFormError("");
    setFeatureModalOpen(true);
  };

  const saveFeature = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!featId.trim() || !featName.trim()) {
      setFormError("Completa el código y el nombre de la funcionalidad.");
      return;
    }
    const now = new Date().toISOString();
    const payload: Feature = {
      id: featId.trim(),
      code: featCode.trim() || featId.trim(),
      moduleId: featModuleId,
      name: featName.trim(),
      description: featDescription.trim(),
      commercialAvailability: featAvailability,
      status: featStatus,
      createdAt: editingFeature?.createdAt ?? now,
      updatedAt: now,
    };

    if (editingFeature) {
      repositories.features.update(editingFeature.id, payload);
    } else {
      repositories.features.create(payload);
    }

    const parentMod = repositories.modules.getById(featModuleId);
    if (parentMod && !parentMod.featureIds.includes(payload.id)) {
      repositories.modules.update(parentMod.id, {
        featureIds: [...parentMod.featureIds, payload.id],
      });
    }
    setFeatureModalOpen(false);
  };

  const toggleRequiredModule = (targetId: string) => {
    setModRequiredIds((current) =>
      current.includes(targetId)
        ? current.filter((item) => item !== targetId)
        : [...current, targetId],
    );
  };

  const productModules = selectedProduct
    ? modules.filter((m) => m.applicationId === selectedProduct.id)
    : [];
  const productFeatures = features.filter((f) => productModules.some((m) => m.id === f.moduleId));
  const productPlans = selectedProduct
    ? plans.filter((p) => (p.applicationId ?? "APP-ERP") === selectedProduct.id)
    : [];

  return (
    <section aria-label="Catálogo de productos, módulos y funcionalidades">
      <div className="page-header">
        <div>
          <div className="eyebrow">Dominio Comercial · Catálogo de Soluciones</div>
          <h1 className="page-title">Productos, Módulos y Funcionalidades</h1>
          <p className="page-description">
            Arquitectura de catálogo en tres niveles: Productos comercializados (aplicaciones),
            Módulos funcionales con control de dependencias y Funcionalidades autorizables por
            licencia.
          </p>
        </div>
        <div className="dashboard-quick-actions">
          <button className="button-muted" type="button" onClick={openCreateFeature}>
            <SaasIcon name="plus" size={15} />
            Nueva funcionalidad
          </button>
          <button className="button-muted" type="button" onClick={openCreateModule}>
            <SaasIcon name="layers" size={15} />
            Nuevo módulo
          </button>
          <button className="button-primary" type="button" onClick={openCreateProduct}>
            <SaasIcon name="products" size={15} />
            Nuevo producto
          </button>
        </div>
      </div>

      <div className="summary-grid" aria-label="Indicadores del catálogo de productos">
        <SummaryCard
          label="Productos comercializados"
          value={applications.length}
          detail={`${applications.filter((a) => a.status === "Activo").length} disponibles en oferta comercial`}
          icon="products"
        />
        <SummaryCard
          label="Módulos funcionales"
          value={modules.length}
          detail={`${modules.filter((m) => (m.requiredModuleIds?.length ?? 0) > 0).length} con reglas de dependencia`}
          icon="layers"
          tone="emerald"
        />
        <SummaryCard
          label="Funcionalidades (Features)"
          value={features.length}
          detail="Capacidades granulares controladas por entitlement"
          icon="sparkles"
          tone="amber"
        />
        <SummaryCard
          label="Planes que los incluyen"
          value={plans.length}
          detail="Empaquetados comerciales listos para contratar"
          icon="plans"
        />
      </div>

      <div className="domain-tabs" role="tablist" aria-label="Nivel del catálogo comercial">
        <button
          type="button"
          role="tab"
          aria-selected={view === "products"}
          className={`domain-tab${view === "products" ? " active" : ""}`}
          onClick={() => setView("products")}
        >
          <SaasIcon name="products" size={15} />
          1. Productos comercializados
          <span className="domain-tab-count">{applications.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "modules"}
          className={`domain-tab${view === "modules" ? " active" : ""}`}
          onClick={() => setView("modules")}
        >
          <SaasIcon name="layers" size={15} />
          2. Módulos y dependencias
          <span className="domain-tab-count">{modules.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "features"}
          className={`domain-tab${view === "features" ? " active" : ""}`}
          onClick={() => setView("features")}
        >
          <SaasIcon name="sparkles" size={15} />
          3. Funcionalidades por módulo
          <span className="domain-tab-count">{features.length}</span>
        </button>
      </div>

      <div className="panel table-panel">
        <FilterToolbar
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder="Buscar por código, nombre, versión, categoría o dependencia..."
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={["Todos", "Activo", "Pendiente", "Inactivo", "Suspendido"]}
          secondaryFilter={view === "products" ? categoryFilter : undefined}
          onSecondaryFilterChange={view === "products" ? setCategoryFilter : undefined}
          secondaryOptions={view === "products" ? ["Todos", ...PRODUCT_CATEGORIES] : undefined}
          secondaryAriaLabel="Filtrar por categoría de producto"
          onReset={() => saasStore.reset()}
          resetLabel="Restablecer catálogo"
        />

        {view === "products" &&
          (filteredProducts.length === 0 ? (
            <EmptyState
              title="No se encontraron productos comercializados"
              description="Limpia los filtros activos o registra un nuevo producto en el catálogo."
              actionLabel="Limpiar filtros"
              onAction={() => {
                setQuery("");
                setStatusFilter("Todos");
                setCategoryFilter("Todos");
              }}
            />
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Producto / Código</th>
                    <th>Categoría y versión comercial</th>
                    <th>Módulos y funcionalidades</th>
                    <th>Disponibilidad comercial</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((app) => {
                    const appMods = modules.filter((m) => m.applicationId === app.id);
                    const appFeats = features.filter((f) =>
                      appMods.some((m) => m.id === f.moduleId),
                    );
                    const isSelected = selectedProduct?.id === app.id;
                    return (
                      <tr
                        key={app.id}
                        onClick={() => setSelectedProductId(app.id)}
                        style={{
                          cursor: "pointer",
                          background: isSelected ? "var(--blue-50)" : undefined,
                        }}
                      >
                        <td>
                          <strong className="row-title">{app.name}</strong>
                          <span className="row-sub">
                            {app.id} · Código: {app.code ?? app.id}
                          </span>
                        </td>
                        <td>
                          <strong className="row-title">
                            {app.category ?? "ERP Eclesial y Parroquial"}
                          </strong>
                          <span className="row-sub">
                            Versión: {app.commercialVersion ?? "2026.1"}
                          </span>
                        </td>
                        <td>
                          <strong className="row-title">
                            {appMods.length} módulo(s) · {appFeats.length} funcionalidad(es)
                          </strong>
                          <span className="row-sub">
                            {appMods.map((m) => m.name).join(", ") || "Sin módulos asociados"}
                          </span>
                        </td>
                        <td>
                          <span className="row-title">
                            {app.commercialAvailability ?? "Disponible general (GA)"}
                          </span>
                          <span className="row-sub">
                            Destinatarios:{" "}
                            {(app.targetEntities ?? ["Parroquias", "Diócesis"])
                              .slice(0, 3)
                              .join(", ")}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={app.status} />
                        </td>
                        <td>
                          <TableRowActions>
                            <TableActionIconButton
                              kind="view"
                              label="Ver ficha"
                              onClick={() => setSelectedProductId(app.id)}
                            />
                            <TableActionIconButton
                              kind="edit"
                              label="Editar"
                              onClick={() => openEditProduct(app)}
                            />
                            <button
                              className="action-link"
                              type="button"
                              onClick={() =>
                                repositories.applications.update(app.id, {
                                  status: app.status === "Activo" ? "Inactivo" : "Activo",
                                })
                              }
                            >
                              {app.status === "Activo" ? "Desactivar" : "Activar"}
                            </button>
                          </TableRowActions>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}

        {view === "modules" &&
          (filteredModules.length === 0 ? (
            <EmptyState
              title="No se encontraron módulos"
              description="Registra un nuevo módulo asociado a un producto."
              actionLabel="Limpiar filtros"
              onAction={() => {
                setQuery("");
                setStatusFilter("Todos");
              }}
            />
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Módulo / Código</th>
                    <th>Producto propietario</th>
                    <th>Dependencias entre módulos</th>
                    <th>Funcionalidades incluidas</th>
                    <th>Disponibilidad</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModules.map((mod) => {
                    const parentApp = applications.find((a) => a.id === mod.applicationId);
                    const modFeats = features.filter((f) => f.moduleId === mod.id);
                    const deps = (mod.requiredModuleIds ?? []).map(
                      (reqId) => modules.find((m) => m.id === reqId)?.name ?? reqId,
                    );
                    const isSelected = selectedModule?.id === mod.id;

                    return (
                      <tr
                        key={mod.id}
                        onClick={() => setSelectedModuleId(mod.id)}
                        style={{
                          cursor: "pointer",
                          background: isSelected ? "var(--blue-50)" : undefined,
                        }}
                      >
                        <td>
                          <strong className="row-title">{mod.name}</strong>
                          <span className="row-sub">
                            {mod.id} · Código: {mod.code ?? mod.id}
                          </span>
                        </td>
                        <td>
                          <strong className="row-title">
                            {parentApp?.name ?? mod.applicationId}
                          </strong>
                          <span className="row-sub">{mod.category ?? "Módulo funcional"}</span>
                        </td>
                        <td>
                          <strong className="row-title">
                            {deps.length > 0
                              ? `Requiere: ${deps.join(", ")}`
                              : "Módulo base (Sin dependencias)"}
                          </strong>
                          <span className="row-sub">
                            Resolución automática al empaquetar planes
                          </span>
                        </td>
                        <td>
                          <strong className="row-title">{modFeats.length} funcionalidad(es)</strong>
                          <span className="row-sub">
                            {modFeats.map((f) => f.code ?? f.id).join(", ") || "Base"}
                          </span>
                        </td>
                        <td>
                          <span className="row-title">
                            {mod.commercialAvailability ?? "Incluido en base"}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={mod.status} />
                        </td>
                        <td>
                          <TableRowActions>
                            <TableActionIconButton
                              kind="edit"
                              label="Editar"
                              onClick={() => openEditModule(mod)}
                            />
                            <button
                              className="action-link"
                              type="button"
                              onClick={() =>
                                repositories.modules.update(mod.id, {
                                  status: mod.status === "Activo" ? "Inactivo" : "Activo",
                                })
                              }
                            >
                              {mod.status === "Activo" ? "Desactivar" : "Activar"}
                            </button>
                          </TableRowActions>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}

        {view === "features" &&
          (filteredFeatures.length === 0 ? (
            <EmptyState
              title="No se encontraron funcionalidades"
              description="Registra una funcionalidad granular dentro de un módulo."
              actionLabel="Limpiar filtros"
              onAction={() => {
                setQuery("");
                setStatusFilter("Todos");
              }}
            />
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Funcionalidad / Código</th>
                    <th>Módulo y producto</th>
                    <th>Descripción operativa</th>
                    <th>Disponibilidad comercial</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeatures.map((feat) => {
                    const mod = modules.find((m) => m.id === feat.moduleId);
                    const app = applications.find((a) => a.id === mod?.applicationId);
                    return (
                      <tr key={feat.id}>
                        <td>
                          <strong className="row-title">{feat.name}</strong>
                          <span className="row-sub">
                            {feat.id} · Código: {feat.code ?? feat.id}
                          </span>
                        </td>
                        <td>
                          <strong className="row-title">{mod?.name ?? feat.moduleId}</strong>
                          <span className="row-sub">Producto: {app?.name ?? "A&O ERP"}</span>
                        </td>
                        <td>
                          <span className="row-title">
                            {feat.description || "Capacidad operativa autorizable por licencia"}
                          </span>
                        </td>
                        <td>
                          <span className="row-title">
                            {feat.commercialAvailability ?? "Disponible general (GA)"}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={feat.status} />
                        </td>
                        <td>
                          <TableRowActions stopPropagation={false}>
                            <TableActionIconButton
                              kind="edit"
                              label="Editar"
                              onClick={() => openEditFeature(feat)}
                            />
                            <button
                              className="action-link"
                              type="button"
                              onClick={() =>
                                repositories.features.update(feat.id, {
                                  status: feat.status === "Activo" ? "Inactivo" : "Activo",
                                })
                              }
                            >
                              {feat.status === "Activo" ? "Desactivar" : "Activar"}
                            </button>
                          </TableRowActions>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
      </div>

      {selectedProduct && (
        <article
          className="master-sheet"
          aria-label={`Ficha de arquitectura del producto ${selectedProduct.name}`}
        >
          <header className="master-sheet-header">
            <div className="master-sheet-identity">
              <div className="master-sheet-badges">
                <span className="code-badge">{selectedProduct.id}</span>
                <span className="code-badge">{selectedProduct.code ?? selectedProduct.id}</span>
                <span className="code-badge">v{selectedProduct.commercialVersion ?? "2026.1"}</span>
                <StatusBadge status={selectedProduct.status} />
              </div>
              <h2 className="master-sheet-title">{selectedProduct.name}</h2>
              <p className="master-sheet-subtitle">{selectedProduct.description}</p>
            </div>
            <div className="master-sheet-actions">
              <button className="button-muted" type="button" onClick={openCreateModule}>
                <SaasIcon name="plus" size={15} />
                Añadir módulo
              </button>
              <button
                className="button-primary"
                type="button"
                onClick={() => openEditProduct(selectedProduct)}
              >
                <SaasIcon name="settings" size={15} />
                Editar producto
              </button>
            </div>
          </header>

          <div className="master-summary-strip">
            <div className="master-summary-item">
              <span>Categoría Comercial</span>
              <strong>{selectedProduct.category ?? "ERP Eclesial y Parroquial"}</strong>
              <small>Versión {selectedProduct.commercialVersion ?? "2026.1"}</small>
            </div>
            <div className="master-summary-item">
              <span>Disponibilidad Comercial</span>
              <strong>{selectedProduct.commercialAvailability ?? "Disponible general (GA)"}</strong>
              <small>Habilitable en contratos y suscripciones</small>
            </div>
            <div className="master-summary-item">
              <span>Arquitectura Modular</span>
              <strong>
                {productModules.length} módulos · {productFeatures.length} funcionalidades
              </strong>
              <small>Árbol de dependencias validado</small>
            </div>
            <div className="master-summary-item">
              <span>Oferta Comercial</span>
              <strong>{productPlans.length} plan(es) comercial(es)</strong>
              <small>
                {(selectedProduct.targetEntities ?? ["Parroquias", "Diócesis"])
                  .slice(0, 3)
                  .join(", ")}
              </small>
            </div>
          </div>

          <div className="master-sheet-body">
            <div className="master-section-grid">
              <section className="master-section-card">
                <div className="master-section-header">
                  <h4>Módulos asociados y árbol de dependencias ({productModules.length})</h4>
                </div>
                <div className="master-relation-list">
                  {productModules.map((mod) => {
                    const resolved = resolveModuleDependencies([mod.id], modules);
                    const modFeats = features.filter((f) => f.moduleId === mod.id);
                    return (
                      <div key={mod.id} className="master-relation-item">
                        <div>
                          <strong className="row-title">
                            {mod.name} ({mod.code ?? mod.id})
                          </strong>
                          <span className="row-sub">
                            {mod.description || mod.category} · {modFeats.length} funcionalidad(es)
                          </span>
                          <span className="row-sub">
                            {resolved.addedDependencyIds.length > 0
                              ? `Dependencias requeridas: ${resolved.addedDependencyIds.join(", ")}`
                              : "Módulo núcleo autónomo"}
                          </span>
                        </div>
                        <StatusBadge status={mod.status} />
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="master-section-card">
                <div className="master-section-header">
                  <h4>Funcionalidades disponibles por módulo ({productFeatures.length})</h4>
                </div>
                <div className="master-relation-list">
                  {productFeatures.map((feat) => {
                    const parentMod = modules.find((m) => m.id === feat.moduleId);
                    return (
                      <div key={feat.id} className="master-relation-item">
                        <div>
                          <strong className="row-title">
                            {feat.name} ({feat.code ?? feat.id})
                          </strong>
                          <span className="row-sub">
                            Módulo: {parentMod?.name ?? feat.moduleId} ·{" "}
                            {feat.description || "Autorizable por licencia"}
                          </span>
                        </div>
                        <StatusBadge status={feat.status} />
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </article>
      )}

      {productModalOpen && (
        <MasterFormModal
          sheetLabel="Catálogo Comercial · Productos"
          entityName={editingProduct ? editingProduct.name : prodName.trim() || "Nuevo producto"}
          recordCode={prodId}
          operation={editingProduct ? "edit" : "create"}
          errorMessage={formError}
          onClose={() => setProductModalOpen(false)}
          onSubmit={saveProduct}
        >
          <MasterFormSection
            step="A"
            title="Información general del producto"
            description="Identificación técnica, código comercial, versión y estado en el portafolio A&O."
          >
            <label className="form-field">
              <span>ID del producto</span>
              <input
                value={prodId}
                disabled={Boolean(editingProduct)}
                onChange={(e) => setProdId(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Código comercial</span>
              <input
                value={prodCode}
                placeholder="Ej. PROD-AO-ERP"
                onChange={(e) => setProdCode(e.target.value)}
              />
            </label>
            <label className="form-field span-2">
              <span>Nombre del producto *</span>
              <input
                value={prodName}
                placeholder="Ej. A&O ERP Institucional"
                onChange={(e) => setProdName(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Categoría</span>
              <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value)}>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Versión comercial</span>
              <input
                value={prodVersion}
                placeholder="Ej. 2026.2 Enterprise"
                onChange={(e) => setProdVersion(e.target.value)}
              />
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="B"
            title="Disponibilidad comercial y alcance"
            description="Estado de comercialización, descripción y entidades eclesiales destinatarias."
          >
            <label className="form-field">
              <span>Disponibilidad comercial</span>
              <select
                value={prodAvailability}
                onChange={(e) => setProdAvailability(e.target.value)}
              >
                {PRODUCT_AVAILABILITY.map((av) => (
                  <option key={av} value={av}>
                    {av}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Estado</span>
              <select
                value={prodStatus}
                onChange={(e) => setProdStatus(e.target.value as EntityStatus)}
              >
                <option value="Activo">Activo</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </label>
            <label className="form-field span-2">
              <span>Descripción comercial y funcional *</span>
              <input
                value={prodDescription}
                placeholder="Describe el alcance del producto..."
                onChange={(e) => setProdDescription(e.target.value)}
              />
            </label>
            <label className="form-field span-2">
              <span>Tipos de instituciones destinatarias (separados por coma)</span>
              <input value={prodTargets} onChange={(e) => setProdTargets(e.target.value)} />
            </label>
          </MasterFormSection>
        </MasterFormModal>
      )}

      {moduleModalOpen && (
        <MasterFormModal
          sheetLabel="Catálogo Comercial · Módulos"
          entityName={editingModule ? editingModule.name : modName.trim() || "Nuevo módulo"}
          recordCode={modId}
          operation={editingModule ? "edit" : "create"}
          errorMessage={formError}
          onClose={() => setModuleModalOpen(false)}
          onSubmit={saveModule}
        >
          <MasterFormSection
            step="A"
            title="Identificación del módulo"
            description="Asociación al producto principal, código funcional y disponibilidad."
          >
            <label className="form-field">
              <span>ID del módulo</span>
              <input
                value={modId}
                disabled={Boolean(editingModule)}
                onChange={(e) => setModId(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Código comercial</span>
              <input
                value={modCode}
                placeholder="Ej. ERP-SAC"
                onChange={(e) => setModCode(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Producto al que pertenece</span>
              <select value={modAppId} onChange={(e) => setModAppId(e.target.value)}>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name} ({app.id})
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Estado</span>
              <select
                value={modStatus}
                onChange={(e) => setModStatus(e.target.value as EntityStatus)}
              >
                <option value="Activo">Activo</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </label>
            <label className="form-field span-2">
              <span>Nombre del módulo *</span>
              <input
                value={modName}
                placeholder="Ej. Sacramentos y partidas"
                onChange={(e) => setModName(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Categoría funcional</span>
              <input value={modCategory} onChange={(e) => setModCategory(e.target.value)} />
            </label>
            <label className="form-field">
              <span>Disponibilidad comercial</span>
              <select value={modAvailability} onChange={(e) => setModAvailability(e.target.value)}>
                <option value="Incluido en base">Incluido en base</option>
                <option value="Módulo adicional">Módulo adicional (Add-on)</option>
                <option value="Bajo contrato institucional">Bajo contrato institucional</option>
              </select>
            </label>
            <label className="form-field span-2">
              <span>Descripción del módulo</span>
              <input value={modDescription} onChange={(e) => setModDescription(e.target.value)} />
            </label>
          </MasterFormSection>

          <MasterFormSection
            step="B"
            title="Dependencias entre módulos"
            description="Selecciona los módulos base que deben estar habilitados para que este módulo pueda operar."
          >
            <div className="form-field span-2">
              <span>Módulos requeridos</span>
              <div className="master-relation-list">
                {modules
                  .filter((m) => m.id !== modId)
                  .map((candidate) => {
                    const checked = modRequiredIds.includes(candidate.id);
                    return (
                      <label
                        key={candidate.id}
                        className="master-relation-item"
                        style={{ cursor: "pointer" }}
                      >
                        <div>
                          <strong className="row-title">
                            {candidate.name} ({candidate.id})
                          </strong>
                          <span className="row-sub">
                            {candidate.description || candidate.category}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleRequiredModule(candidate.id)}
                        />
                      </label>
                    );
                  })}
              </div>
            </div>
          </MasterFormSection>
        </MasterFormModal>
      )}

      {featureModalOpen && (
        <MasterFormModal
          sheetLabel="Catálogo Comercial · Funcionalidades"
          entityName={
            editingFeature ? editingFeature.name : featName.trim() || "Nueva funcionalidad"
          }
          recordCode={featId}
          operation={editingFeature ? "edit" : "create"}
          errorMessage={formError}
          onClose={() => setFeatureModalOpen(false)}
          onSubmit={saveFeature}
        >
          <MasterFormSection
            step="A"
            title="Definición de la funcionalidad"
            description="Capacidad específica perteneciente a un módulo funcional."
          >
            <label className="form-field">
              <span>ID de funcionalidad</span>
              <input
                value={featId}
                disabled={Boolean(editingFeature)}
                onChange={(e) => setFeatId(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Código de entitlement</span>
              <input
                value={featCode}
                placeholder="Ej. FT-CERTIFICADOS"
                onChange={(e) => setFeatCode(e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>Módulo al que pertenece</span>
              <select value={featModuleId} onChange={(e) => setFeatModuleId(e.target.value)}>
                {modules.map((mod) => (
                  <option key={mod.id} value={mod.id}>
                    {mod.name} ({mod.id})
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Estado</span>
              <select
                value={featStatus}
                onChange={(e) => setFeatStatus(e.target.value as EntityStatus)}
              >
                <option value="Activo">Activo</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </label>
            <label className="form-field span-2">
              <span>Nombre de la funcionalidad *</span>
              <input
                value={featName}
                placeholder="Ej. Sacramentos · expedición digital de partidas"
                onChange={(e) => setFeatName(e.target.value)}
              />
            </label>
            <label className="form-field span-2">
              <span>Descripción operativa</span>
              <input value={featDescription} onChange={(e) => setFeatDescription(e.target.value)} />
            </label>
          </MasterFormSection>
        </MasterFormModal>
      )}
    </section>
  );
}
