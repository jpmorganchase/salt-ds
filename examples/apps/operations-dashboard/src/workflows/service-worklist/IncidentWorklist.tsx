import {
  Banner,
  BannerActions,
  BannerContent,
  Button,
  FlexLayout,
  H2,
  Input,
  Panel,
  StatusIndicator,
  Table,
  TBody,
  TD,
  Text,
  TH,
  THead,
  TR,
} from "@salt-ds/core";
import { SearchIcon } from "@salt-ds/icons";
import type { ReactNode } from "react";
import type { IncidentRecord, ServiceRecord } from "./types";
import "./ServiceWorklist.css";

export type WorklistState = "loading" | "ready" | "refreshing" | "error";

export interface IncidentWorklistProps {
  allServiceCount: number;
  incidents: IncidentRecord[];
  localDemoControls?: ReactNode;
  onInspect: (service: ServiceRecord) => void;
  onInspectIncident: (incidentId: string) => void;
  onQueryChange: (query: string) => void;
  onRefresh: () => void;
  onRetryRefresh: () => void;
  query: string;
  refreshLabel?: string;
  refreshMessage?: string;
  retryLabel?: string;
  selectedIncidentId?: string;
  services: ServiceRecord[];
  state: WorklistState;
}

function statusForService(status: ServiceRecord["status"]) {
  if (status === "Operational") return "success";
  if (status === "Degraded") return "warning";
  return "info";
}

export function IncidentWorklist({
  allServiceCount,
  incidents,
  localDemoControls,
  onInspect,
  onInspectIncident,
  onQueryChange,
  onRefresh,
  onRetryRefresh,
  query,
  refreshLabel = "Refresh worklist",
  refreshMessage,
  retryLabel = "Retry worklist refresh",
  selectedIncidentId,
  services,
  state,
}: IncidentWorklistProps) {
  const normalizedQuery = query.trim();
  const isLoading = state === "loading";
  const isRefreshing = state === "refreshing";
  const isEmpty = !isLoading && allServiceCount === 0;
  const hasNoMatch =
    !isLoading &&
    !isEmpty &&
    services.length === 0 &&
    normalizedQuery.length > 0;

  return (
    <>
      <Panel className="servicePanel" variant="secondary">
        <section id="services" aria-labelledby="services-title" tabIndex={-1}>
          <div className="panelHeader">
            <div>
              <H2 id="services-title">Service health</H2>
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
                onChange: (event) => onQueryChange(event.currentTarget.value),
              }}
            />
          </div>
          {isLoading ? (
            <p className="worklistMessage" role="status">
              Loading worklist.
            </p>
          ) : isEmpty ? (
            <p className="worklistMessage">There are no services available.</p>
          ) : hasNoMatch ? (
            <p className="worklistMessage">
              No services match “{normalizedQuery}”. Clear the filter or try
              another service.
            </p>
          ) : (
            <>
              <p className="worklistCount" role="status">
                Showing {services.length} of {allServiceCount} services
              </p>
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
                      <TH>Actions</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {services.map((service) => (
                      <TR key={service.id}>
                        <TH scope="row">{service.name}</TH>
                        <TD>{service.owner}</TD>
                        <TD>{service.region}</TD>
                        <TD>
                          <FlexLayout gap={1} align="center">
                            <StatusIndicator
                              status={statusForService(service.status)}
                            />
                            {service.status}
                          </FlexLayout>
                        </TD>
                        <TD>{service.latency}</TD>
                        <TD>
                          <Button
                            appearance="bordered"
                            onClick={() => onInspect(service)}
                          >
                            Inspect {service.name}
                          </Button>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </div>
            </>
          )}
        </section>
      </Panel>

      <Panel className="incidentWorklist" variant="secondary">
        <section
          id="incidents"
          className="incidentWorklistContent"
          aria-labelledby="incidents-title"
          tabIndex={-1}
        >
          <div>
            <H2 id="incidents-title">Incident worklist</H2>
            <Text color="secondary">
              Inspect a service to review or update its incident record.
            </Text>
          </div>
          <div className="worklistActions">
            <Button
              appearance="bordered"
              disabled={isLoading}
              loading={isRefreshing}
              loadingAnnouncement="Refreshing worklist."
              onClick={onRefresh}
            >
              {refreshLabel}
            </Button>
            {localDemoControls}
          </div>
          {state === "error" && (
            <Banner status="error">
              <BannerContent role="alert">
                The worklist refresh failed. The current services remain
                available.
              </BannerContent>
              <BannerActions>
                <Button appearance="bordered" onClick={onRetryRefresh}>
                  {retryLabel}
                </Button>
              </BannerActions>
            </Banner>
          )}
          {refreshMessage && <p role="status">{refreshMessage}</p>}
          {incidents.length > 0 && (
            <ul className="incidentList" aria-label="Incidents">
              {incidents.map((incident) => (
                <li key={incident.id}>
                  <Button
                    appearance="transparent"
                    aria-pressed={selectedIncidentId === incident.id}
                    onClick={() => onInspectIncident(incident.id)}
                  >
                    Inspect {incident.id}: {incident.title}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Panel>
    </>
  );
}
