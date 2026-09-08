import { Button, Card, CardContent, H2, Text } from "@salt-ds/core";
import type { RefObject } from "react";
import type { IncidentRecord, ServiceRecord } from "./types";
import "./ServiceWorklist.css";

export interface IncidentInspectorProps {
  incident?: IncidentRecord;
  onCreate: () => void;
  onEdit: () => void;
  service?: ServiceRecord;
  triggerRef: RefObject<HTMLButtonElement>;
}

export function IncidentInspector({
  incident,
  onCreate,
  onEdit,
  service,
  triggerRef,
}: IncidentInspectorProps) {
  return (
    <section
      className="incidentInspector"
      aria-labelledby="incident-details-title"
    >
      <Card variant="secondary">
        <CardContent>
          <H2 id="incident-details-title">Incident details</H2>
          {incident ? (
            <>
              <dl className="incidentDetailsList">
                <div>
                  <dt>Incident</dt>
                  <dd>{incident.id}</dd>
                </div>
                <div>
                  <dt>Title</dt>
                  <dd>{incident.title}</dd>
                </div>
                <div>
                  <dt>Service</dt>
                  <dd>{incident.service}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{incident.status}</dd>
                </div>
                <div>
                  <dt>Updated</dt>
                  <dd>{incident.updated}</dd>
                </div>
              </dl>
              <Button appearance="bordered" onClick={onEdit} ref={triggerRef}>
                Edit incident
              </Button>
            </>
          ) : service ? (
            <>
              <Text color="secondary">
                No open incident for {service.name}.
              </Text>
              <Button appearance="bordered" onClick={onCreate} ref={triggerRef}>
                Create incident
              </Button>
            </>
          ) : (
            <Text color="secondary">
              Select a service from the worklist to inspect its incident record.
            </Text>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
