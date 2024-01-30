import {
  Banner,
  BannerContent,
  GridLayout,
  H3,
  FormField,
  FormFieldLabel,
  Input,
  InteractableCard,
  InteractableCardProps,
  Spinner,
  Text,
} from "@salt-ds/core";
import {
  FilterIcon,
  ProgressInprogressIcon,
  ProgressTodoIcon,
} from "@salt-ds/icons";
import { ReactNode, useEffect, useState } from "react";
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

  const filteredRoadmapData = roadmapData.filter(
    (r) =>
      (r.quarter !== null || r.startSprint !== null || r.endSprint !== null) &&
      r.title.match(new RegExp(searchQuery, "i"))
  );

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        const response = await fetch(`${endpoint}`, {
          signal: abortController.signal,
        });
        const items = (await response.json()).nodes as unknown[];
        //creates an array of objects with data from github
        const extractedData: RoadmapData[] = items?.map(mapRoadmapData);

        setRoadmapData(extractedData || []);
      } catch (error) {
        <Banner status="info">
          <BannerContent>No data available</BannerContent>
        </Banner>;
      }
    };

    void fetchData();

    return () => {
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          onChange={(event) =>
            setSearchQuery((event.target as HTMLInputElement).value)
          }
          className={styles.searchInput}
          startAdornment={<FilterIcon />}
        />
      </FormField>

      {roadmapData !== null && roadmapData.length > 0 ? (
        <CardView data={filteredRoadmapData} />
      ) : (
        <Spinner
          className={styles.loading}
          aria-label="loading"
          role="status"
          size="large"
        />
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
          .sort((a, b) => a.quarter!.title.localeCompare(b.quarter!.title))
          .map((item) => (
            <ColumnData key={item.id} item={item} />
          ))}
      </div>
    </GridLayout>
  );
};
