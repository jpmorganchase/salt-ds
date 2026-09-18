export type ServiceHealthStatus = "Operational" | "Degraded" | "Maintenance";

export interface ServiceRecord {
  id: string;
  name: string;
  owner: string;
  region: string;
  status: ServiceHealthStatus;
  latency: string;
}

export interface IncidentRecord {
  id: string;
  title: string;
  service: string;
  status: "Investigating" | "Open";
  updated: string;
}
