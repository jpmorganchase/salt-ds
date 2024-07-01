import {
  Banner,
  BannerContent,
  FormField,
  FormFieldLabel,
  GridLayout,
  H3,
  Input,
  InteractableCard,
  type InteractableCardProps,
  Spinner,
  Text,
} from "@salt-ds/core";
import {
  FilterIcon,
  ProgressInprogressIcon,
  ProgressTodoIcon,
} from "@salt-ds/icons";
import { type ReactNode, useEffect, useState } from "react";
import { Heading4 } from "../mdx/h4";

import styles from "./style.module.css";

interface RoadmapProps {
  title: string;
  children: ReactNode;
  endpoint: string;
}

interface IterationData {
  title: string; // e.g. Q1
  startDate: string; // e.g. "2024-01-01"
  duration: number; // e.g. 91
}

interface RoadmapData {
  id: string;
  startSprint: IterationData | null;
  endSprint: IterationData | null;
  issueUrl: string;
  title: string;
  quarter: IterationData | null;
}

function RoadmapCard(props: InteractableCardProps) {
  return (
    <>
      <InteractableCard accentPlacement="left" {...props} />
    </>
  );
}

export const Roadmap = ({ endpoint }: RoadmapProps) => {
  const [roadmapData, setRoadmapData] = useState<RoadmapData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<"pending" | "success" | "error">(
    "pending"
  );

  const filteredRoadmapData = roadmapData.filter(
    (r) =>
      (r.quarter !== null || r.startSprint !== null || r.endSprint !== null) &&
      r.title.match(new RegExp(searchQuery, "i"))
  );

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        setStatus("pending");
        const response = await fetch(`${endpoint}`, {
          signal: abortController.signal,
        });
        const items = (await response.json()).nodes as unknown[];
        //creates an array of objects with data from github
        const extractedData: RoadmapData[] = items?.map(mapRoadmapData);

        setRoadmapData(extractedData || []);
        setStatus("success");
      } catch (error) {
        setStatus("error");
      }
    };

    void fetchData();

    return () => {
      abortController.abort();
    };
  }, [endpoint]);

  const mapRoadmapData = (responseItem: any): RoadmapData => {
    const data: RoadmapData = {
      id: responseItem.id,
      startSprint: null,
      endSprint: null,
      issueUrl: responseItem.content.url,
      title: "",
      quarter: null,
    };
    for (const fieldValueNode of responseItem.fieldValues.nodes) {
      if (!("field" in fieldValueNode)) {
        continue;
      }
      switch (fieldValueNode.field.name) {
        case "Title": {
          data.title = fieldValueNode.text;
          break;
        }
        case "Start Sprint": {
          data.startSprint = {
            title: fieldValueNode.title,
            startDate: fieldValueNode.startDate,
            duration: fieldValueNode.duration,
          };
          break;
        }
        case "End Sprint": {
          data.endSprint = {
            title: fieldValueNode.title,
            startDate: fieldValueNode.startDate,
            duration: fieldValueNode.duration,
          };
          break;
        }
        case "Quarter": {
          data.quarter = {
            title: fieldValueNode.title,
            startDate: fieldValueNode.startDate,
            duration: fieldValueNode.duration,
          };
          break;
        }
      }
    }
    return data;
  };

  return (
    <div className={styles.content}>
      <FormField>
        <FormFieldLabel>Filter list</FormFieldLabel>
        <Input
          value={searchQuery}
          variant="secondary"
          inputProps={{
            onChange: (event) => setSearchQuery(event.target.value),
          }}
          className={styles.searchInput}
          startAdornment={<FilterIcon />}
        />
      </FormField>

      {roadmapData.length > 0 ? (
        <CardView data={filteredRoadmapData} />
      ) : status !== "error" ? (
        <Spinner
          className={styles.loading}
          aria-label="loading"
          role="status"
          size="large"
        />
      ) : (
        <Banner status="info">
          <BannerContent>No data available</BannerContent>
        </Banner>
      )}
    </div>
  );
};

const ColumnData: React.FC<{ item: RoadmapData; future?: boolean }> = ({
  item,
  future = true,
}) => {
  return (
    <>
      <a href={item.issueUrl}>
        <RoadmapCard
          className={future ? styles.cardFuture : styles.cardInProgress}
          key={item.id}
        >
          <Heading4 className={styles.heading4}>{item.title}</Heading4>
          {future ? (
            <Text>Scheduled for: {item.quarter?.title}</Text>
          ) : (
            <Text>Target for sprint: {item.endSprint?.title}</Text>
          )}
        </RoadmapCard>
      </a>
    </>
  );
};

interface CardViewProps {
  data: RoadmapData[];
}

const CardView = ({ data }: CardViewProps) => {
  const plannedData: RoadmapData[] = [];
  const inProgressData: RoadmapData[] = [];

  for (const d of data) {
    if (d.endSprint) {
      const sprintDate = new Date(d.endSprint.startDate);
      sprintDate.setDate(sprintDate.getDate() + d.endSprint.duration);
      if (new Date() < sprintDate) {
        inProgressData.push(d);
      } else {
        plannedData.push(d);
      }
    } else {
      plannedData.push(d);
    }
  }

  return (
    <GridLayout className={styles.cardContainer} columns={2}>
      <div className={styles.column}>
        <H3 className={styles.heading}>
          <ProgressInprogressIcon className={styles.progressIcon} size={2} />
          In-Progress{" "}
        </H3>
        {inProgressData.map((item) => (
          <ColumnData future={false} key={item.id} item={item} />
        ))}
      </div>
      <div className={styles.column}>
        <H3 className={styles.heading}>
          <ProgressTodoIcon className={styles.backlogIcon} size={2} />
          In backlog
        </H3>
        {plannedData
          .sort((a, b) => {
            const aQuarter = a.quarter?.title ?? "";
            const bQuarter = b.quarter?.title ?? "";
            return aQuarter.localeCompare(bQuarter);
          })
          .map((item) => (
            <ColumnData key={item.id} item={item} />
          ))}
      </div>
    </GridLayout>
  );
};
