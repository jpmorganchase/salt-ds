import {
  Card,
  FormField,
  FormFieldLabel,
  GridLayout,
  Input,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  Text,
  ToggleButton,
  ToggleButtonGroup,
} from "@salt-ds/core";
import { useId, useState } from "react";

const incidents = [
  {
    id: "order-gateway",
    service: "Order gateway",
    team: "Trading",
    summary: "Delayed order acknowledgements",
  },
  {
    id: "pricing-feed",
    service: "Pricing feed",
    team: "Trading",
    summary: "Stale price updates",
  },
  {
    id: "settlement-queue",
    service: "Settlement queue",
    team: "Operations",
    summary: "Processing backlog",
  },
];

export const ToggleButtonGroupViewSwitching = () => {
  const [view, setView] = useState("list");
  const [filter, setFilter] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const id = useId();
  const query = filter.trim().toLowerCase();
  const visibleIncidents = incidents.filter((incident) =>
    `${incident.service} ${incident.team} ${incident.summary}`
      .toLowerCase()
      .includes(query),
  );
  const selectedIncident = incidents.find(
    (incident) => incident.id === selectedId,
  );

  return (
    <StackLayout gap={2} style={{ width: "100%", maxWidth: 720 }}>
      <FormField>
        <FormFieldLabel>Filter incidents</FormFieldLabel>
        <Input
          value={filter}
          inputProps={{
            onChange: (event) => setFilter(event.currentTarget.value),
          }}
        />
      </FormField>
      <StackLayout gap={1} align="start">
        <Text id={`${id}-view`}>View</Text>
        <ToggleButtonGroup
          aria-labelledby={`${id}-view`}
          value={view}
          onChange={(event) => setView(event.currentTarget.value)}
        >
          <ToggleButton value="list">List</ToggleButton>
          <ToggleButton value="cards">Cards</ToggleButton>
        </ToggleButtonGroup>
      </StackLayout>
      <RadioButtonGroup
        aria-label="Select an incident"
        value={selectedId}
        onChange={(event) => setSelectedId(event.currentTarget.value)}
      >
        {visibleIncidents.length ? (
          <GridLayout
            as="ul"
            aria-label="Incidents"
            columns={
              view === "cards"
                ? "repeat(auto-fit, minmax(min(100%, 220px), 1fr))"
                : 1
            }
            gap={2}
            style={{ listStyle: "none" }}
          >
            {visibleIncidents.map((incident) => {
              const details = (
                <StackLayout gap={1}>
                  <RadioButton
                    label={incident.service}
                    value={incident.id}
                    inputProps={{
                      "aria-describedby": `${id}-${incident.id}`,
                    }}
                  />
                  <Text id={`${id}-${incident.id}`}>
                    {incident.team}: {incident.summary}
                  </Text>
                </StackLayout>
              );
              return (
                <li key={incident.id}>
                  {view === "cards" ? (
                    <Card elevation="flat">{details}</Card>
                  ) : (
                    details
                  )}
                </li>
              );
            })}
          </GridLayout>
        ) : (
          <Text>No incidents match the filter.</Text>
        )}
      </RadioButtonGroup>
      <Text>Selected incident: {selectedIncident?.service ?? "None"}</Text>
    </StackLayout>
  );
};
