import {
  Banner,
  BannerContent,
  GridLayout,
  H3,
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
import { Key, ReactNode, useEffect, useState } from "react";
import { formatDate } from "../../utils/formatDate";
import { Heading4 } from "../mdx/h4";

import styles from "./style.module.css";

interface RoadmapProps {
  title: string;
  children: ReactNode;
  endpoint: string;
}

interface RoadmapData {
  content: { url: string };
  id: string;
  startDate: Date;
  targetDate: Date;
  issueUrl: string;
  text: string;
  quarter: string;
}

interface CardViewProps {
  data: RoadmapData[];
  searchQuery: string;
}

function sortRoadmapDataByDate(roadmapData: RoadmapData[]): RoadmapData[] {
  const sortedData = [...roadmapData];
  sortedData.sort((a, b) => {
    const startDateA = new Date(a.targetDate);
    const startDateB = new Date(b.targetDate);

    if (isNaN(startDateA.getTime())) {
      return 1; // Item A doesn't have a valid date, so it should be placed below item B
    } else if (isNaN(startDateB.getTime())) {
      return -1; // Item B doesn't have a valid date, so it should be placed below item A
    } else {
      return startDateA.getTime() - startDateB.getTime();
    }
  });
  return sortedData;
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
  const sortedRoadmapData = sortRoadmapDataByDate(roadmapData);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${endpoint}`);
        const items = (await response.json()?.data?.organization?.repository
          ?.projectV2?.items?.nodes) as unknown[];

        //creates an array of objects with data from github
        const extractedData: RoadmapData[] = items?.map((item: RoadmapData) => {
          const fieldValueNodes = item?.fieldValues?.nodes;
          const text = getFieldValueByName(fieldValueNodes, "Title");
          const startDate = getFieldValueByName(fieldValueNodes, "Start Date");
          const targetDate = getFieldValueByName(
            fieldValueNodes,
            "Target Date"
          );
          const quarter = getFieldValueByName(fieldValueNodes, "Quarter");
          const issueUrl = item?.content?.url;

          return { text, startDate, targetDate, quarter, issueUrl };
        });

        setRoadmapData(extractedData || []);
      } catch (error) {
        <Banner status="info">
          <BannerContent>No data available</BannerContent>
        </Banner>;
      }
    };

    fetchData();
  }, []);

  const getFieldValueByName = (fieldValueNodes: any[], fieldName: string) => {
    const fieldValueNode = fieldValueNodes?.find(
      (node: any) => node?.field?.name === fieldName
    );
    return (
      fieldValueNode?.text ||
      fieldValueNode?.date ||
      fieldValueNode?.name ||
      fieldValueNode?.title ||
      ""
    );
  };

  return (
    <div className={styles.content}>
      <Input
        value={searchQuery}
        variant="secondary"
        onChange={(event) =>
          setSearchQuery((event.target as HTMLInputElement).value)
        }
        className={styles.searchInput}
        startAdornment={<FilterIcon />}
      />

      {roadmapData !== null && roadmapData.length > 0 ? (
        <CardView data={sortedRoadmapData} searchQuery={searchQuery} />
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

interface ItemProps {
  targetDate: string | number | Date;
  id: Key | null | undefined;
  issueUrl: string | undefined;
  text:
    | string
    | number
    | boolean
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | React.ReactFragment
    | React.ReactPortal
    | null
    | undefined;
  quarter: string;
}
const ColumnData: React.FC<{ item: ItemProps; future?: boolean }> = ({
  item,
  future = true,
}) => {
  const formattedDate = formatDate(new Date(item.targetDate));

  return (
    <>
      <a href={item.issueUrl}>
        <RoadmapCard
          className={future ? styles.cardFuture : styles.cardInProgress}
          key={item.id}
        >
          <Heading4 className={styles.heading4}>{item.text}</Heading4>
          <Text>
            Due Date:
            <span className={styles.date}> {formattedDate}</span>
          </Text>
          <Text>Scheduled in quarter: {item.quarter}</Text>
        </RoadmapCard>
      </a>
    </>
  );
};

export const CardView = ({ data, searchQuery }: CardViewProps) => {
  const futureData = data.filter((item) => {
    const startDate = item.startDate ? new Date(item.startDate) : null;
    const today = new Date();
    const isFutureItem = !startDate || startDate > today;
    const matchesSearchQuery =
      searchQuery === "" ||
      item.text.toLowerCase().includes(searchQuery.toLowerCase());
    return isFutureItem && matchesSearchQuery;
  });

  const inProgressData = data.filter((item) => {
    const startDate = new Date(item.startDate);
    const targetDate = new Date(item.targetDate);
    const today = new Date();
    const isInRange = startDate <= today && today <= targetDate;
    const matchesSearchQuery =
      searchQuery === "" ||
      item.text.toLowerCase().includes(searchQuery.toLowerCase());
    return isInRange && matchesSearchQuery;
  });

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
        {futureData.map((item) => (
          <ColumnData key={item.id} item={item} />
        ))}
      </div>
    </GridLayout>
  );
};
