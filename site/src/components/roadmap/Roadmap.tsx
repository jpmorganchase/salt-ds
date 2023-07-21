import { ReactNode, SetStateAction, useEffect, useState } from "react";
import {
  GridLayout,
  Card,
  CardProps,
  Input,
  Link,
  Banner,
  BannerContent,
} from "@salt-ds/core";
import styles from "./style.module.css";
import {
  ProgressInprogressIcon,
  ProgressPendingIcon,
  SearchIcon,
} from "@salt-ds/icons";
import { Heading3 } from "../mdx/h3";
import { formatDate } from "src/utils/formatDate";
import { Heading2 } from "../mdx/h2";

type RoadmapProps = { title: string; children: ReactNode };

interface RoadmapData {
  id: string;
  startDate: Date;
  targetDate: Date;
  issueUrl: string;
  text: string;
}

type RoadmapDataItem = {
  content: any;
  fieldValues: any;
  text: string;
  startDate: string;
  targetDate: string;
  status: string;
  issueUrl: string;
};

interface CardViewProps {
  sortedRoadmapData: RoadmapData[];
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

function RoadmapCard(props: CardProps) {
  return <Card {...props} />;
}

export const Roadmap = ({ title, children }: RoadmapProps) => {
  const [roadmapData, setRoadmapData] = useState<any[]>([]);
  const sortedRoadmapData = sortRoadmapDataByDate(roadmapData);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        //gets the data
        const response = await fetch("/api/roadmap");
        const responseData = await response.json();

        const items =
          responseData?.data?.organization?.repository?.projectV2?.items?.nodes;

        //creates an array of objects with data from github
        const extractedData: RoadmapDataItem[] = items?.map(
          (item: RoadmapDataItem) => {
            const fieldValueNodes = item?.fieldValues?.nodes;
            const text = getFieldValueByName(fieldValueNodes, "Title");
            const startDate = getFieldValueByName(
              fieldValueNodes,
              "Start Date"
            );
            const targetDate = getFieldValueByName(
              fieldValueNodes,
              "Target Date"
            );
            const status = getFieldValueByName(fieldValueNodes, "Status");
            const issueUrl = item?.content?.url;

            return { text, startDate, targetDate, status, issueUrl };
          }
        );

        //sets the data to retrieved data or null
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
    <div className={styles.container}>
      <div className={styles.content}>
        <Input
          placeholder="Search"
          value={searchQuery}
          onChange={(event) =>
            setSearchQuery((event.target as HTMLInputElement).value)
          }
          className={styles.bar}
          startAdornment={<SearchIcon />}
        />

        {roadmapData !== null && roadmapData.length > 0 ? (
          <CardView
            sortedRoadmapData={sortedRoadmapData}
            searchQuery={searchQuery}
          />
        ) : (
          <Banner status="info">
            <BannerContent>No data available</BannerContent>
          </Banner>
        )}
      </div>
    </div>
  );
};

export const CardView = ({ sortedRoadmapData, searchQuery }: CardViewProps) => {
  return (
    <GridLayout className={styles.cardContainer} columns={3}>
      <div className={styles.column}>
        <Heading2 className={styles.heading}>
          Future <ProgressPendingIcon className={styles.icon} size={1.4} />
        </Heading2>
        {sortedRoadmapData
          .filter((item) => {
            const startDate = item.startDate ? new Date(item.startDate) : null;
            const today = new Date();
            const isFutureItem = !startDate || startDate > today;
            const matchesSearchQuery =
              searchQuery === "" ||
              item.text.toLowerCase().includes(searchQuery.toLowerCase());
            return isFutureItem && matchesSearchQuery;
          })
          .map((item) => {
            const formattedDate = formatDate(new Date(item.targetDate));

            return (
              <RoadmapCard className={styles.card} key={item.id}>
                <Link>
                  <Heading3 className={styles.heading3}>
                    <a href={item.issueUrl}>{item.text}</a>
                  </Heading3>
                </Link>
                <b>Due Date: </b>
                <p className={styles.date}>{formattedDate}</p>
              </RoadmapCard>
            );
          })}
      </div>
      <div className={styles.column}>
        <Heading2 className={styles.heading}>
          In Progress{" "}
          <ProgressInprogressIcon className={styles.icon} size={1.4} />
        </Heading2>
        {sortedRoadmapData
          .filter((item) => {
            const startDate = new Date(item.startDate);
            const targetDate = new Date(item.targetDate);
            const today = new Date();
            const isInRange = startDate <= today && today <= targetDate;
            const matchesSearchQuery =
              searchQuery === "" ||
              item.text.toLowerCase().includes(searchQuery.toLowerCase());
            return isInRange && matchesSearchQuery;
          })
          .map((item) => {
            const formattedDate = formatDate(new Date(item.targetDate));

            return (
              <RoadmapCard key={item.id} className={styles.card}>
                <Link>
                  <Heading3 className={styles.heading3}>
                    <a href={item.issueUrl}>{item.text}</a>
                  </Heading3>
                </Link>
                <p className={styles.date}>
                  <b>Due date: </b>
                  {formattedDate}
                </p>
              </RoadmapCard>
            );
          })}
      </div>
    </GridLayout>
  );
};
