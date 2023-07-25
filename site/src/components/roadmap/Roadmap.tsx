import { Key, ReactNode, useEffect, useState } from "react";
import {
  GridLayout,
  Input,
  Banner,
  BannerContent,
  InteractableCard,
  InteractableCardProps,
  H3,
} from "@salt-ds/core";
import styles from "./style.module.css";
import {
  FilterIcon,
  ProgressInprogressIcon,
  ProgressPendingIcon,
} from "@salt-ds/icons";
import { formatDate } from "src/utils/formatDate";
import { Heading4 } from "../mdx/h4";

type RoadmapProps = { title: string; children: ReactNode; endpoint: string };

interface RoadmapData {
  content: any;
  fieldValues: any;
  id: string;
  startDate: Date;
  targetDate: Date;
  issueUrl: string;
  text: string;
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

function RoadmapCard(props: InteractableCardProps, item: ItemProps) {
  return (
    <>
      <InteractableCard accentPlacement="left" {...props} />
    </>
  );
}

export const Roadmap = ({ title, children, endpoint }: RoadmapProps) => {
  const [roadmapData, setRoadmapData] = useState<any[]>([]);
  const sortedRoadmapData = sortRoadmapDataByDate(roadmapData);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${endpoint}`);
        const responseData = await response.json();

        const items =
          responseData?.data?.organization?.repository?.projectV2?.items?.nodes;

        //creates an array of objects with data from github
        const extractedData: RoadmapData[] = items?.map((item: RoadmapData) => {
          const fieldValueNodes = item?.fieldValues?.nodes;
          const text = getFieldValueByName(fieldValueNodes, "Title");
          const startDate = getFieldValueByName(fieldValueNodes, "Start Date");
          const targetDate = getFieldValueByName(
            fieldValueNodes,
            "Target Date"
          );
          const issueUrl = item?.content?.url;

          return { text, startDate, targetDate, issueUrl };
        });

        setRoadmapData(extractedData || []);
      } catch (error) {
        console.error("Could not fetch roadmap data");
      }
    };

    fetchData();
  }, []);

  const getFieldValueByName = (fieldValueNodes: any[], fieldName: string) => {
    const fieldValueNode = fieldValueNodes?.find(
      (node: any) => node?.field?.name === fieldName
    );
    return (
      fieldValueNode?.text || fieldValueNode?.date || fieldValueNode?.name || ""
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
        <Banner status="info">
          <BannerContent>No data available</BannerContent>
        </Banner>
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
          Due Date:
          <p className={styles.date}> {formattedDate}</p>
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
          In Progress{" "}
        </H3>
        {inProgressData.map((item) => (
          <ColumnData future={false} key={item.id} item={item} />
        ))}
      </div>
      <div className={styles.column}>
        <H3 className={styles.heading}>
          <ProgressPendingIcon className={styles.futureIcon} size={2} />
          Future
        </H3>
        {futureData.map((item) => (
          <ColumnData key={item.id} item={item} />
        ))}
      </div>
    </GridLayout>
  );
};
