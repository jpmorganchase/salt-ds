import {
  FormField,
  FormFieldLabel,
  GridLayout,
  H3,
  Input,
  InteractableCard,
  InteractableCardGroup,
  ListBox,
  Option,
  RadioButtonIcon,
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

  const visibleSelectedId = visibleIncidents.some(
    (incident) => incident.id === selectedId,
  )
    ? selectedId
    : "";

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
      {visibleIncidents.length === 0 ? (
        <Text>No incidents match the filter.</Text>
      ) : view === "cards" ? (
        <InteractableCardGroup
          aria-label="Select an incident"
          value={visibleSelectedId}
          onChange={(_event, value) => {
            if (typeof value === "string") setSelectedId(value);
          }}
        >
          <GridLayout
            columns="repeat(auto-fill, minmax(min(100%, 220px), 1fr))"
            gap={2}
            style={{ width: "100%", gridAutoRows: "1fr" }}
          >
            {visibleIncidents.map((incident) => (
              <InteractableCard
                key={incident.id}
                value={incident.id}
                aria-labelledby={`${id}-${incident.id}-title`}
                aria-describedby={`${id}-${incident.id}`}
              >
                <StackLayout gap={1}>
                  <H3 id={`${id}-${incident.id}-title`} style={{ margin: 0 }}>
                    {incident.service}
                  </H3>
                  <StackLayout direction="row" gap={1}>
                    <RadioButtonIcon
                      aria-hidden
                      checked={selectedId === incident.id}
                    />
                    <Text id={`${id}-${incident.id}`}>
                      {incident.team}: {incident.summary}
                    </Text>
                  </StackLayout>
                </StackLayout>
              </InteractableCard>
            ))}
          </GridLayout>
        </InteractableCardGroup>
      ) : (
        <ListBox
          aria-label="Select an incident"
          selected={selectedId ? [selectedId] : []}
          onSelectionChange={(_event, selected) =>
            setSelectedId(selected[0] ?? "")
          }
          valueToString={(value) =>
            incidents.find((incident) => incident.id === value)?.service ??
            value
          }
          style={{ width: "100%" }}
        >
          {visibleIncidents.map((incident) => (
            <Option
              key={incident.id}
              value={incident.id}
              aria-labelledby={`${id}-${incident.id}-title`}
              aria-describedby={`${id}-${incident.id}`}
            >
              <StackLayout gap={0.5}>
                <Text id={`${id}-${incident.id}-title`}>
                  {incident.service}
                </Text>
                <Text id={`${id}-${incident.id}`} color="inherit">
                  {incident.team}: {incident.summary}
                </Text>
              </StackLayout>
            </Option>
          ))}
        </ListBox>
      )}
      <Text>Selected incident: {selectedIncident?.service ?? "None"}</Text>
    </StackLayout>
  );
};
