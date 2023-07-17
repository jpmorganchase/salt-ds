import { ReactNode, SetStateAction, useEffect, useState } from "react";
import { Grid, GridColumn } from "@salt-ds/data-grid";
import { GridLayout, GridItem, Card, H1, CardProps, Button, Input, H3, Link } from "@salt-ds/core";
import styles from "./style.module.css";
import { ProgressInprogressIcon, ProgressPendingIcon, SearchIcon } from "@salt-ds/icons";


type CalloutProps = { title: string; children: ReactNode };

interface RoadmapData {
  id: string;
  startDate: string;
  targetDate: string;
  issueUrl: string;
  text: string;
}

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


function formatDate(date: Date): string {
  if (isNaN(date.getTime())) {
    return "To be seen";
  } else {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };


    const formatter = new Intl.DateTimeFormat(undefined, options);
    const formattedDateParts = formatter.formatToParts(date);

    const monthNumber = date.getMonth()+1;
    const quarter = Math.floor((monthNumber-1)/3) + 1;
    const day = formattedDateParts.find((part) => part.type === 'day')?.value;
    const month = formattedDateParts.find((part) => part.type === 'month')?.value;
    const year = formattedDateParts.find((part) => part.type === 'year')?.value;
    
    return `${day} ${month} ${year} (Q${quarter})`;
  }
}



function RoadmapCard (props: CardProps) {
  return <Card className={styles.spacing} style={{ width: "250px", marginBottom: "15px", minHeight: "unset"}}
  {...props} />
}

export const Roadmap = ({ title, children }: CalloutProps) => {

  const [jsonData, setJsonData] = useState("");
  const [roadmapData, setRoadmapData] = useState<any[]>([]);
  const sortedRoadmapData = sortRoadmapDataByDate(roadmapData);
  const [searchQuery, setSearchQuery] = useState("");


  useEffect(() => {
   
    const fetchData = async () => {
      try {
        //gets the data
        const response = await fetch('/api/roadmap');
        const responseData = await response.json();
        const jsonString = JSON.stringify(responseData, null, 2);
        setJsonData(jsonString);

        const items = responseData?.data?.organization?.repository?.projectV2?.items?.nodes;
        console.log(items); // Check the structure of the extracted items data

        //creates an array of objects with data from github
        const extractedData = items?.map((item: any) => {
          const fieldValueNodes = item?.fieldValues?.nodes;
          const text = getFieldValueByName(fieldValueNodes, "Title");
          const startDate = getFieldValueByName(fieldValueNodes, "Start Date");
          const targetDate = getFieldValueByName(fieldValueNodes, "Target Date");
          const status = getFieldValueByName(fieldValueNodes, "Status");
          const issueUrl = item?.content?.url;

          return { text, startDate, targetDate, status, issueUrl };
        });

        
        //sets the data to retrieved data or null
        setRoadmapData(extractedData || []);
        
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);




  const getFieldValueByName = (fieldValueNodes: any[], fieldName: string) => {
    const fieldValueNode = fieldValueNodes?.find((node: any) => node?.field?.name === fieldName);
    return fieldValueNode?.text || fieldValueNode?.date || fieldValueNode?.name || "";
  };

  return (
    <div>

    <Input placeholder="Search" value={searchQuery}
        onChange={(event) =>
          setSearchQuery((event.target as HTMLInputElement).value)
        }
        style={{width: "400px", marginBottom:" 50px "}}
        startAdornment={<SearchIcon />}
      />

        {/* <TableView sortedRoadmapData={sortedRoadmapData} searchQuery={searchQuery}/> */}
        <CardView sortedRoadmapData={sortedRoadmapData} searchQuery={searchQuery}  />

    </div>

  );
};

export const TableView = ({ sortedRoadmapData, searchQuery }: CardViewProps) => {
  const filteredData = sortedRoadmapData.filter((item) => {
    const matchesSearchQuery =
      searchQuery === "" ||
      item.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearchQuery;
  });

  return (
    <Grid rowData={filteredData} style={{ height: 2000 }}>
      <GridColumn
        name="Name"
        id="name"
        defaultWidth={200}
        getValue={(rowData) => rowData.text}
      />
      <GridColumn
        name="Release"
        id="location"
        defaultWidth={150}
        getValue={(rowData) => {
          const formattedDate = formatDate(new Date(rowData.targetDate));
          return formattedDate;
        }}
      />
    </Grid>
  );
};



export const CardView = ({ sortedRoadmapData, searchQuery }: CardViewProps) => {

  return(
    <GridLayout  style={{ maxWidth: "1000px", paddingBottom: "00px"}}  columns={3}  >

    <div className={styles.column}>
      <h2 className={styles.heading} style={{marginLeft: "22%"}}>Future <ProgressPendingIcon className={styles.icon} size={1.4}/></h2>
        {  sortedRoadmapData.filter((item) => {
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
              <H1 style={{ marginTop: "-10px" }} styleAs="h3">
              <a href={item.issueUrl}>
                    {item.text}
                  
                  </a>
                </H1>
                </Link>
                <b>Due Date: </b>
                <p className={styles.date}>{formattedDate}</p>
              </RoadmapCard>
            );
          })}
  </div>
  <div className={styles.column}>
    <h2 className={styles.heading} style={{marginLeft: "13%"}}>In Progress <ProgressInprogressIcon  className={styles.icon} size={1.4}/></h2>
      {sortedRoadmapData.filter((item) => {
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
            <RoadmapCard key={item.id}>
              <Link>
              <H1 style={{ marginTop: "-10px" }} styleAs="h3">
              <a href={item.issueUrl}>
                    {item.text}
                  
                  </a>
                </H1>
                </Link>
                <p className={styles.date}><b>Due date: </b>{formattedDate}</p>
            </RoadmapCard>
          );
        })}
  </div>
</GridLayout>



  );



}