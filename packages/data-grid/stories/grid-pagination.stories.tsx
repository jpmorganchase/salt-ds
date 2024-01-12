import { StoryFn } from "@storybook/react";
import { SyntheticEvent, useMemo, useState } from "react";
import { FlexLayout } from "@salt-ds/core";
import { Grid, GridColumn, RowSelectionCheckboxColumn } from "../src";
import { Pagination, Paginator } from "@salt-ds/lab";
import { createDummyInvestors, investorKeyGetter } from "./dummyData";
import "./grid.stories.css";

export default {
  title: "Data Grid/Data Grid",
  component: Grid,
  argTypes: {},
};

const dummyInvestors = createDummyInvestors();

const GridPaginationTemplate: StoryFn<{}> = (props) => {
  const [page, setPage] = useState<number>(1);
  const pageSize = 7;
  const pageCount = Math.ceil(dummyInvestors.length / pageSize);

  const onPageChange = (event: SyntheticEvent, page: number) => {
    setPage(page);
  };

  const rowData = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, dummyInvestors.length);
    return dummyInvestors.slice(start, end);
  }, [pageSize, page]);

  return (
    <FlexLayout direction={"column"} align={"end"}>
      <Grid
        rowData={rowData}
        rowKeyGetter={investorKeyGetter}
        className="paginatedGrid"
        zebra={true}
        columnSeparators={true}
        headerIsFocusable={true}
      >
        <RowSelectionCheckboxColumn id="rowSelection" />
        <GridColumn
          name="Name"
          id="name"
          defaultWidth={200}
          getValue={(x) => x.name}
        />
        <GridColumn
          name="Location"
          id="location"
          defaultWidth={150}
          getValue={(x) => x.location}
        />
        <GridColumn
          name="Amount"
          id="amount"
          defaultWidth={200}
          getValue={(x) => x.amount}
          align="right"
        />
      </Grid>
      <Pagination page={page} onPageChange={onPageChange} count={pageCount}>
        <Paginator data-testid="paginator" />
      </Pagination>
    </FlexLayout>
  );
};

export const GridPagination = GridPaginationTemplate.bind({});
