import type { IncidentRecord, ServiceRecord } from "./types";

export const initialServices: ServiceRecord[] = [
  {
    id: "order-gateway",
    name: "Order gateway",
    owner: "Trading platform",
    region: "London",
    status: "Operational",
    latency: "42 ms",
  },
  {
    id: "risk-calculator",
    name: "Risk calculator",
    owner: "Risk engineering",
    region: "New York",
    status: "Degraded",
    latency: "187 ms",
  },
  {
    id: "reference-data",
    name: "Reference data",
    owner: "Data services",
    region: "Singapore",
    status: "Operational",
    latency: "65 ms",
  },
  {
    id: "client-reporting",
    name: "Client reporting",
    owner: "Digital channels",
    region: "London",
    status: "Maintenance",
    latency: "—",
  },
];

export const initialIncidents: IncidentRecord[] = [
  {
    id: "INC-1042",
    title: "Risk calculator latency",
    service: "Risk calculator",
    status: "Investigating",
    updated: "Today at 09:42 UTC",
  },
];

export const LOCAL_WORKLIST_BEHAVIOR =
  "The local demo refresh fails once, preserves the current worklist, and succeeds on retry.";

export interface LocalWorklistAdapter {
  load(): Promise<ServiceRecord[]>;
  refresh(): Promise<ServiceRecord[]>;
}

const delay = (milliseconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });

export function createLocalWorklistAdapter(
  services: ServiceRecord[],
): LocalWorklistAdapter {
  let failedOnce = false;

  return {
    async load() {
      await delay(350);
      return services;
    },
    async refresh() {
      await delay(700);
      if (!failedOnce) {
        failedOnce = true;
        throw new Error(
          "The local worklist refresh failed. The current services remain available.",
        );
      }
      return services;
    },
  };
}
