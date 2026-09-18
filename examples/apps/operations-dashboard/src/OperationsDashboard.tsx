import {
  Banner,
  BannerContent,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  FlexLayout,
  FormField,
  FormFieldLabel,
  H1,
  Input,
  SaltProviderNext,
  StackLayout,
  StatusIndicator,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Text,
  type Density,
  type Mode,
} from "@salt-ds/core";
import { AddIcon, DarkIcon, LightIcon, SearchIcon } from "@salt-ds/icons";
import { type FormEvent, useMemo, useState } from "react";

const services = [
  { name: "Order gateway", owner: "Trading platform", region: "London", status: "Operational", latency: "42 ms" },
  { name: "Risk calculator", owner: "Risk engineering", region: "New York", status: "Degraded", latency: "187 ms" },
  { name: "Reference data", owner: "Data services", region: "Singapore", status: "Operational", latency: "65 ms" },
  { name: "Client reporting", owner: "Digital channels", region: "London", status: "Maintenance", latency: "—" },
];

export function OperationsDashboard() {
  const [mode, setMode] = useState<Mode>("light");
  const [density, setDensity] = useState<Density>("low");
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [created, setCreated] = useState(false);

  const visibleServices = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized
      ? services.filter((service) => Object.values(service).some((value) => value.toLowerCase().includes(normalized)))
      : services;
  }, [query]);

  const createIncident = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDialogOpen(false);
    setCreated(true);
  };

  return (
    <SaltProviderNext mode={mode} density={density} accent="teal" corner="rounded">
      <div className="dashboardShell" data-mode={mode} data-density={density}>
        <header className="topBar">
          <a className="brand" href="#main">Northstar operations</a>
          <nav aria-label="Primary navigation">
            <a aria-current="page" href="#services">Services</a>
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
              {mode === "light" ? <DarkIcon aria-hidden /> : <LightIcon aria-hidden />}
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

          {created && (
            <Banner status="success">
              <BannerContent role="status">Incident created and responders notified.</BannerContent>
            </Banner>
          )}

          <section className="metrics" aria-label="Operational metrics">
            <article><span>Healthy services</span><strong>18</strong><Text color="secondary">of 20 monitored</Text></article>
            <article><span>Open incidents</span><strong>2</strong><Text color="secondary">1 high priority</Text></article>
            <article><span>Change success</span><strong>99.2%</strong><Text color="secondary">past 30 days</Text></article>
          </section>

          <section id="services" className="servicePanel" aria-labelledby="services-title">
            <div className="panelHeader">
              <div><h2 id="services-title">Service health</h2><Text color="secondary">Production services across all regions</Text></div>
              <Input
                aria-label="Filter services"
                placeholder="Filter services"
                startAdornment={<SearchIcon aria-hidden />}
                value={query}
                inputProps={{
                  onChange: (event) => setQuery(event.currentTarget.value),
                }}
              />
            </div>
            <div className="tableScroller">
              <Table>
                <THead><TR><TH>Service</TH><TH>Owner</TH><TH>Region</TH><TH>Status</TH><TH>Latency</TH></TR></THead>
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

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen} size="small" status="warning">
          <form onSubmit={createIncident} aria-label="Create incident">
            <DialogHeader header="Create incident" description="Record the impact before notifying responders." />
            <DialogContent>
              <StackLayout gap={2}>
                <FormField>
                  <FormFieldLabel>Incident title</FormFieldLabel>
                  <Input name="title" inputProps={{ required: true }} placeholder="Risk calculator latency" />
                </FormField>
                <FormField>
                  <FormFieldLabel>Affected service</FormFieldLabel>
                  <Input name="service" inputProps={{ required: true }} placeholder="Risk calculator" />
                </FormField>
              </StackLayout>
            </DialogContent>
            <DialogActions>
              <Button appearance="transparent" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" sentiment="accented">Create incident</Button>
            </DialogActions>
          </form>
        </Dialog>
      </div>
    </SaltProviderNext>
  );
}
