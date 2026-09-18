import {
  Banner,
  BannerContent,
  Button,
  type Density,
  Dialog,
  DialogHeader,
  FlexLayout,
  H1,
  Input,
  type Mode,
  SaltProviderNext,
  StackLayout,
  StatusIndicator,
  Table,
  TBody,
  TD,
  Text,
  TH,
  THead,
  TR,
} from "@salt-ds/core";
import { AddIcon, DarkIcon, LightIcon, SearchIcon } from "@salt-ds/icons";
import { Metric, MetricContent, MetricHeader } from "@salt-ds/lab";
import { useMemo, useRef, useState } from "react";
import { createLocalDemoAdapter } from "./workflows/record-form/localDemoAdapter";
import { RecordForm } from "./workflows/record-form/RecordForm";
import {
  type RecordDraft,
  type RecordFormSubmission,
} from "./workflows/record-form/types";

const services = [
  {
    name: "Order gateway",
    owner: "Trading platform",
    region: "London",
    status: "Operational",
    latency: "42 ms",
  },
  {
    name: "Risk calculator",
    owner: "Risk engineering",
    region: "New York",
    status: "Degraded",
    latency: "187 ms",
  },
  {
    name: "Reference data",
    owner: "Data services",
    region: "Singapore",
    status: "Operational",
    latency: "65 ms",
  },
  {
    name: "Client reporting",
    owner: "Digital channels",
    region: "London",
    status: "Maintenance",
    latency: "—",
  },
];

export function OperationsDashboard() {
  const [mode, setMode] = useState<Mode>("light");
  const [density, setDensity] = useState<Density>("low");
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lastCreatedRecord, setLastCreatedRecord] =
    useState<RecordDraft | null>(null);
  const [draft, setDraft] = useState<RecordDraft>({
    title: "",
    service: services[1].name,
  });
  const [submission, setSubmission] = useState<RecordFormSubmission>({
    status: "idle",
  });
  const [localDemoAdapter] = useState(createLocalDemoAdapter);
  const submitting = useRef(false);

  const visibleServices = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized
      ? services.filter((service) =>
          Object.values(service).some((value) =>
            value.toLowerCase().includes(normalized),
          ),
        )
      : services;
  }, [query]);

  const closeRecordForm = () => {
    if (submitting.current || submission.status === "pending") return;
    setSubmission({ status: "idle" });
    setDialogOpen(false);
  };

  const createIncident = (nextDraft: RecordDraft) => {
    if (submitting.current) return;
    submitting.current = true;
    setLastCreatedRecord(null);
    setSubmission({ status: "pending" });
    void localDemoAdapter
      .submit(nextDraft)
      .then((record) => {
        setLastCreatedRecord(record);
        setSubmission({ status: "idle" });
        setDialogOpen(false);
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

  return (
    <SaltProviderNext
      mode={mode}
      density={density}
      accent="teal"
      corner="rounded"
    >
      <div className="dashboardShell" data-mode={mode} data-density={density}>
        <header className="topBar">
          <a className="brand" href="#main">
            Northstar operations
          </a>
          <nav aria-label="Primary navigation">
            <a aria-current="page" href="#services">
              Services
            </a>
            <a href="#incidents">Incidents</a>
            <a href="#changes">Changes</a>
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
              <Text color="secondary">Live service health</Text>
              <H1 id="page-title">Operations overview</H1>
              <Text>Last refreshed today at 09:42 UTC</Text>
            </StackLayout>
            <Button sentiment="accented" onClick={() => setDialogOpen(true)}>
              <AddIcon aria-hidden /> Create incident
            </Button>
          </section>

          {lastCreatedRecord && (
            <Banner status="success">
              <BannerContent role="status">
                Local demo recorded {lastCreatedRecord.title} for{" "}
                {lastCreatedRecord.service}. No notification was sent.
              </BannerContent>
            </Banner>
          )}

          <section className="metrics" aria-label="Operational metrics">
            <article>
              <Metric>
                <MetricHeader title="Healthy services" />
                <MetricContent value="18" subvalue="of 20 monitored" />
              </Metric>
            </article>
            <article>
              <Metric>
                <MetricHeader title="Open incidents" />
                <MetricContent value="2" subvalue="1 high priority" />
              </Metric>
            </article>
            <article>
              <Metric>
                <MetricHeader title="Change success" />
                <MetricContent value="99.2%" subvalue="past 30 days" />
              </Metric>
            </article>
          </section>

          <section
            id="services"
            className="servicePanel"
            aria-labelledby="services-title"
          >
            <div className="panelHeader">
              <div>
                <h2 id="services-title">Service health</h2>
                <Text color="secondary">
                  Production services across all regions
                </Text>
              </div>
              <Input
                placeholder="Filter services"
                startAdornment={<SearchIcon aria-hidden />}
                value={query}
                inputProps={{
                  "aria-label": "Filter services",
                  onChange: (event) => setQuery(event.currentTarget.value),
                }}
              />
            </div>
            <div
              className="tableScroller"
              role="region"
              aria-label="Service health table"
              tabIndex={0}
            >
              <Table>
                <THead>
                  <TR>
                    <TH>Service</TH>
                    <TH>Owner</TH>
                    <TH>Region</TH>
                    <TH>Status</TH>
                    <TH>Latency</TH>
                  </TR>
                </THead>
                <TBody>
                  {visibleServices.map((service) => (
                    <TR key={service.name}>
                      <TH scope="row">{service.name}</TH>
                      <TD>{service.owner}</TD>
                      <TD>{service.region}</TD>
                      <TD>
                        <FlexLayout gap={1} align="center">
                          <StatusIndicator
                            status={
                              service.status === "Operational"
                                ? "success"
                                : service.status === "Degraded"
                                  ? "warning"
                                  : "info"
                            }
                          />
                          {service.status}
                        </FlexLayout>
                      </TD>
                      <TD>{service.latency}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </div>
          </section>
        </main>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open) closeRecordForm();
            else setDialogOpen(true);
          }}
          size="medium"
          status="warning"
        >
          <DialogHeader
            header="Create incident"
            description="Save a local incident record for the selected service. No data leaves this demo."
          />
          <RecordForm
            draft={draft}
            onCancel={closeRecordForm}
            onChange={setDraft}
            onSubmit={createIncident}
            submission={submission}
          />
        </Dialog>
      </div>
    </SaltProviderNext>
  );
}
