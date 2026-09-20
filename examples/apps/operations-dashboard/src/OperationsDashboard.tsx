import {
  Banner,
  BannerContent,
  Button,
  Card,
  CardContent,
  type Density,
  Dialog,
  DialogHeader,
  FlexLayout,
  H1,
  Link,
  type Mode,
  SaltProviderNext,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { AddIcon, DarkIcon, LightIcon } from "@salt-ds/icons";
import { Metric, MetricContent, MetricHeader } from "@salt-ds/lab";
import { useEffect, useMemo, useRef, useState } from "react";
import { createLocalDemoAdapter } from "./workflows/record-form/localDemoAdapter";
import { RecordForm } from "./workflows/record-form/RecordForm";
import type {
  RecordDraft,
  RecordFormSubmission,
} from "./workflows/record-form/types";
import { IncidentInspector } from "./workflows/service-worklist/IncidentInspector";
import {
  IncidentWorklist,
  type WorklistState,
} from "./workflows/service-worklist/IncidentWorklist";
import {
  createLocalWorklistAdapter,
  initialIncidents,
  initialServices,
} from "./workflows/service-worklist/localWorklistAdapter";
import type {
  IncidentRecord,
  ServiceRecord,
} from "./workflows/service-worklist/types";

type DialogMode = "create" | "edit";
type ActivityNotice =
  | { kind: "created"; record: RecordDraft }
  | { kind: "updated"; incidentId: string }
  | undefined;

function sectionFromLocationHash(): "services" | "incidents" {
  return window.location.hash === "#incidents" ? "incidents" : "services";
}

export function OperationsDashboard() {
  const [mode, setMode] = useState<Mode>("light");
  const [density, setDensity] = useState<Density>("low");
  const [activeSection, setActiveSection] = useState(sectionFromLocationHash);
  const [query, setQuery] = useState("");
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [worklistState, setWorklistState] = useState<WorklistState>("loading");
  const [refreshMessage, setRefreshMessage] = useState<string>();
  const [emptyDemo, setEmptyDemo] = useState(false);
  const [incidents, setIncidents] =
    useState<IncidentRecord[]>(initialIncidents);
  const [selectedServiceId, setSelectedServiceId] = useState<string>();
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [editingIncidentId, setEditingIncidentId] = useState<string>();
  const [activityNotice, setActivityNotice] = useState<ActivityNotice>();
  const [createDraft, setCreateDraft] = useState<RecordDraft>({
    title: "",
    service: initialServices[1].name,
  });
  const [hasStartedCreateDraft, setHasStartedCreateDraft] = useState(false);
  const [editDrafts, setEditDrafts] = useState<Record<string, RecordDraft>>({});
  const [submission, setSubmission] = useState<RecordFormSubmission>({
    status: "idle",
  });
  const [localDemoAdapter] = useState(createLocalDemoAdapter);
  const [worklistAdapter] = useState(() =>
    createLocalWorklistAdapter(initialServices),
  );
  const submitting = useRef(false);
  const nextIncidentId = useRef(1043);
  const createTriggerRef = useRef<HTMLButtonElement>(null);
  const inspectorTriggerRef = useRef<HTMLButtonElement>(null);
  const dialogTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [restoreDialogFocus, setRestoreDialogFocus] = useState(false);

  useEffect(() => {
    let active = true;
    void worklistAdapter.load().then((loadedServices) => {
      if (!active) return;
      setServices(loadedServices);
      setWorklistState("ready");
    });
    return () => {
      active = false;
    };
  }, [worklistAdapter]);

  useEffect(() => {
    if (!dialogOpen && restoreDialogFocus) {
      dialogTriggerRef.current?.focus();
      setRestoreDialogFocus(false);
    }
  }, [dialogOpen, restoreDialogFocus]);

  useEffect(() => {
    const syncActiveSection = () => {
      setActiveSection(sectionFromLocationHash());
    };
    window.addEventListener("hashchange", syncActiveSection);
    return () => window.removeEventListener("hashchange", syncActiveSection);
  }, []);

  const visibleServices = useMemo(() => {
    if (emptyDemo) return [];
    const normalized = query.trim().toLowerCase();
    return normalized
      ? services.filter((service) =>
          Object.values(service).some((value) =>
            value.toLowerCase().includes(normalized),
          ),
        )
      : services;
  }, [emptyDemo, query, services]);

  const selectedIncident = selectedIncidentId
    ? incidents.find((incident) => incident.id === selectedIncidentId)
    : undefined;
  const selectedService = selectedIncident
    ? services.find((service) => service.name === selectedIncident.service)
    : services.find((service) => service.id === selectedServiceId);
  const activeDraft =
    dialogMode === "edit" && editingIncidentId
      ? (editDrafts[editingIncidentId] ??
        (selectedIncident
          ? { title: selectedIncident.title, service: selectedIncident.service }
          : createDraft))
      : createDraft;
  const healthyServiceCount = services.filter(
    (service) => service.status === "Operational",
  ).length;
  const regionCount = new Set(services.map((service) => service.region)).size;

  const closeRecordForm = () => {
    if (submitting.current || submission.status === "pending") return;
    setSubmission({ status: "idle" });
    setDialogOpen(false);
    setRestoreDialogFocus(true);
  };

  const openCreateIncident = (trigger: HTMLButtonElement | null) => {
    dialogTriggerRef.current = trigger;
    setDialogMode("create");
    setEditingIncidentId(undefined);
    if (!hasStartedCreateDraft) {
      setCreateDraft({
        title: "",
        service: selectedService?.name ?? initialServices[1].name,
      });
      setHasStartedCreateDraft(true);
    }
    setSubmission({ status: "idle" });
    setDialogOpen(true);
  };

  const openEditIncident = () => {
    if (!selectedIncident) return;
    dialogTriggerRef.current = inspectorTriggerRef.current;
    setDialogMode("edit");
    setEditingIncidentId(selectedIncident.id);
    setEditDrafts((currentDrafts) =>
      currentDrafts[selectedIncident.id]
        ? currentDrafts
        : {
            ...currentDrafts,
            [selectedIncident.id]: {
              title: selectedIncident.title,
              service: selectedIncident.service,
            },
          },
    );
    setSubmission({ status: "idle" });
    setDialogOpen(true);
  };

  const submitIncident = (nextDraft: RecordDraft) => {
    if (submitting.current) return;
    submitting.current = true;
    setActivityNotice(undefined);
    setSubmission({ status: "pending" });
    void localDemoAdapter
      .submit(nextDraft)
      .then((record) => {
        if (dialogMode === "edit" && editingIncidentId) {
          setIncidents((currentIncidents) =>
            currentIncidents.map((incident) =>
              incident.id === editingIncidentId
                ? { ...incident, ...record, updated: "Just now" }
                : incident,
            ),
          );
          setEditDrafts((currentDrafts) => {
            const { [editingIncidentId]: _completedDraft, ...remainingDrafts } =
              currentDrafts;
            return remainingDrafts;
          });
          setActivityNotice({ kind: "updated", incidentId: editingIncidentId });
        } else {
          const createdIncident: IncidentRecord = {
            id: `INC-${nextIncidentId.current++}`,
            ...record,
            status: "Open",
            updated: "Just now",
          };
          setIncidents((currentIncidents) => [
            ...currentIncidents,
            createdIncident,
          ]);
          setActivityNotice({ kind: "created", record });
          setSelectedServiceId(
            services.find((service) => service.name === record.service)?.id,
          );
          setSelectedIncidentId(createdIncident.id);
          setCreateDraft({ title: "", service: initialServices[1].name });
          setHasStartedCreateDraft(false);
        }
        setSubmission({ status: "idle" });
        setDialogOpen(false);
        setRestoreDialogFocus(true);
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : "The local demo could not save this record. Your details are still available; retry when ready.";
        setSubmission({ status: "failed", message });
      })
      .finally(() => {
        submitting.current = false;
      });
  };

  const refreshWorklist = () => {
    if (worklistState === "loading" || worklistState === "refreshing") return;
    setWorklistState("refreshing");
    setRefreshMessage(undefined);
    void worklistAdapter
      .refresh()
      .then((loadedServices) => {
        setServices(loadedServices);
        setWorklistState("ready");
        setRefreshMessage(
          `Worklist refreshed. Showing ${loadedServices.length} of ${initialServices.length} services.`,
        );
      })
      .catch(() => {
        setWorklistState("error");
      });
  };

  const inspectService = (service: ServiceRecord) => {
    setSelectedServiceId(service.id);
    setSelectedIncidentId(
      incidents.find((incident) => incident.service === service.name)?.id,
    );
  };

  const inspectIncident = (incidentId: string) => {
    const incident = incidents.find((current) => current.id === incidentId);
    if (!incident) return;
    setSelectedIncidentId(incident.id);
    setSelectedServiceId(
      services.find((service) => service.name === incident.service)?.id,
    );
  };

  const updateActiveDraft = (nextDraft: RecordDraft) => {
    if (dialogMode === "edit" && editingIncidentId) {
      setEditDrafts((currentDrafts) => ({
        ...currentDrafts,
        [editingIncidentId]: nextDraft,
      }));
      return;
    }
    setCreateDraft(nextDraft);
  };

  return (
    <SaltProviderNext
      mode={mode}
      density={density}
      accent="teal"
      corner="rounded"
    >
      <div className="dashboardShell" data-mode={mode} data-density={density}>
        <header className="topBar">
          <Link
            className="brand"
            color="inherit"
            href="#main"
            underline="never"
          >
            Northstar operations
          </Link>
          <nav aria-label="Primary navigation">
            <Link
              aria-current={
                activeSection === "services" ? "location" : undefined
              }
              color="inherit"
              href="#services"
              underline="never"
            >
              Services
            </Link>
            <Link
              aria-current={
                activeSection === "incidents" ? "location" : undefined
              }
              color="inherit"
              href="#incidents"
              underline="never"
            >
              Incidents
            </Link>
          </nav>
          <FlexLayout className="topActions" gap={1}>
            <Button
              appearance="transparent"
              data-testid="mode-toggle"
              aria-label={`Use ${mode === "light" ? "dark" : "light"} mode`}
              onClick={() => setMode(mode === "light" ? "dark" : "light")}
            >
              {mode === "light" ? (
                <DarkIcon aria-hidden />
              ) : (
                <LightIcon aria-hidden />
              )}
            </Button>
            <Button
              appearance="bordered"
              data-testid="density-toggle"
              onClick={() => setDensity(density === "low" ? "high" : "low")}
            >
              Density: {density}
            </Button>
          </FlexLayout>
        </header>

        <main id="main" className="dashboardMain">
          <section className="pageHeading" aria-labelledby="page-title">
            <StackLayout gap={1}>
              <Text color="secondary">Local operations worklist</Text>
              <H1 id="page-title">Operations overview</H1>
              <Text>Local fixture data. No external requests are made.</Text>
            </StackLayout>
            <Button
              sentiment="accented"
              onClick={() => openCreateIncident(createTriggerRef.current)}
              ref={createTriggerRef}
            >
              <AddIcon aria-hidden /> Create incident
            </Button>
          </section>

          {activityNotice?.kind === "created" && (
            <Banner status="success">
              <BannerContent role="status">
                Local demo recorded {activityNotice.record.title} for{" "}
                {activityNotice.record.service}. No notification was sent.
              </BannerContent>
            </Banner>
          )}
          {activityNotice?.kind === "updated" && (
            <Banner status="success">
              <BannerContent role="status">
                Incident {activityNotice.incidentId} updated.
              </BannerContent>
            </Banner>
          )}

          <section className="metrics" aria-label="Operational metrics">
            <Card>
              <CardContent>
                <Metric>
                  <MetricHeader title="Healthy services" />
                  <MetricContent
                    value={String(healthyServiceCount)}
                    subvalue={`of ${services.length} local services`}
                  />
                </Metric>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Metric>
                  <MetricHeader title="Open incidents" />
                  <MetricContent
                    value={String(incidents.length)}
                    subvalue="local worklist records"
                  />
                </Metric>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Metric>
                  <MetricHeader title="Regions represented" />
                  <MetricContent
                    value={String(regionCount)}
                    subvalue="in the local fixture"
                  />
                </Metric>
              </CardContent>
            </Card>
          </section>

          <div className="worklistLayout">
            <IncidentWorklist
              allServiceCount={emptyDemo ? 0 : services.length}
              incidents={emptyDemo ? [] : incidents}
              localDemoControls={
                <FlexLayout
                  align="center"
                  gap={1}
                  role="group"
                  aria-label="Local demo controls"
                >
                  <Text color="secondary">Local demo:</Text>
                  {emptyDemo ? (
                    <Button
                      appearance="transparent"
                      onClick={() => setEmptyDemo(false)}
                    >
                      Restore worklist
                    </Button>
                  ) : (
                    <Button
                      appearance="transparent"
                      onClick={() => {
                        setEmptyDemo(true);
                        setSelectedServiceId(undefined);
                        setSelectedIncidentId(undefined);
                      }}
                    >
                      Show empty state
                    </Button>
                  )}
                </FlexLayout>
              }
              onInspect={inspectService}
              onInspectIncident={inspectIncident}
              onQueryChange={setQuery}
              onRefresh={refreshWorklist}
              onRetryRefresh={refreshWorklist}
              query={query}
              refreshMessage={refreshMessage}
              selectedIncidentId={selectedIncidentId}
              services={visibleServices}
              state={worklistState}
            />
            <IncidentInspector
              incident={selectedIncident}
              onCreate={() => openCreateIncident(inspectorTriggerRef.current)}
              onEdit={openEditIncident}
              service={selectedService}
              triggerRef={inspectorTriggerRef}
            />
          </div>
        </main>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open) closeRecordForm();
            else setDialogOpen(true);
          }}
          size="medium"
        >
          <DialogHeader
            header={dialogMode === "edit" ? "Edit incident" : "Create incident"}
            description={`${
              dialogMode === "edit"
                ? "Update this local incident record. No data leaves this demo."
                : "Save a local incident record for the selected service. No data leaves this demo."
            } Close keeps unsaved changes for reopening. Reloading this demo clears them.`}
          />
          <RecordForm
            draft={activeDraft}
            formLabel={
              dialogMode === "edit" ? "Edit incident record" : undefined
            }
            onCancel={closeRecordForm}
            onChange={updateActiveDraft}
            onSubmit={submitIncident}
            submission={submission}
            submitLabel={dialogMode === "edit" ? "Update incident" : undefined}
          />
        </Dialog>
      </div>
    </SaltProviderNext>
  );
}
