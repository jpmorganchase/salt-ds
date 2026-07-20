import {
  Button,
  CompactInput,
  CompactPaginator,
  Dropdown,
  FlexLayout,
  Option,
  Pagination,
  StackLayout,
  Text,
} from "@salt-ds/core";
import { FirstIcon, LastIcon } from "@salt-ds/icons";
import type { GridApi, PaginationChangedEvent } from "ag-grid-community";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import {
  type SyntheticEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import dataGridExampleColumns from "../dependencies/dataGridExampleColumns";
import dataGridExampleData from "../dependencies/dataGridExampleData";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";

const PAGE_SIZES = [20, 50, 100] as const;

const generateData = (states: typeof dataGridExampleData) =>
  states.reduce(
    (result, row) => {
      const data = [];
      data.push(row);
      for (let i = 0; i < 20; i++) {
        data.push({ ...row, name: `${row.name} ${i}` });
      }
      return result.concat(data);
    },
    [] as typeof dataGridExampleData,
  );

const formatCount = (value: number) => value.toLocaleString("en-US");

const PaginationExample = (props: AgGridReactProps) => {
  const { onPaginationChanged: onPaginationChangedProp } = props;
  const { agGridProps, containerProps } = useAgGridHelpers();
  const gridApiRef = useRef<GridApi | undefined>(undefined);
  const rowData = useMemo(() => generateData(dataGridExampleData), []);

  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [rowCount, setRowCount] = useState(0);

  const syncPaginationState = useCallback((api: GridApi) => {
    gridApiRef.current = api;
    setPage(api.paginationGetCurrentPage() + 1);
    setPageCount(api.paginationGetTotalPages());
    setPageSize(api.paginationGetPageSize());
    setRowCount(api.paginationGetRowCount());
  }, []);

  const handlePaginationChanged = useCallback(
    (event: PaginationChangedEvent) => {
      syncPaginationState(event.api);
      onPaginationChangedProp?.(event);
    },
    [onPaginationChangedProp, syncPaginationState],
  );

  const handlePageChange = useCallback(
    (_event: SyntheticEvent, nextPage: number) => {
      gridApiRef.current?.paginationGoToPage(nextPage - 1);
    },
    [],
  );

  const handlePageSizeChange = useCallback(
    (_event: SyntheticEvent, selected: number[]) => {
      const nextPageSize = selected[0];
      if (nextPageSize == null) {
        return;
      }
      setPageSize(nextPageSize);
      gridApiRef.current?.setGridOption("paginationPageSize", nextPageSize);
    },
    [],
  );

  const firstRow = rowCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRow = Math.min(page * pageSize, rowCount);
  const rangeLabel = `${formatCount(firstRow)} to ${formatCount(lastRow)} of ${formatCount(rowCount)}`;

  const isOnFirstPage = page <= 1;
  const isOnLastPage = pageCount === 0 || page >= pageCount;

  return (
    <StackLayout gap={0} style={{ width: containerProps.style?.width }}>
      <div {...containerProps}>
        <AgGridReact
          {...agGridProps}
          {...props}
          columnDefs={dataGridExampleColumns}
          pagination
          paginationPageSize={pageSize}
          paginationPageSizeSelector={false}
          suppressPaginationPanel
          rowData={rowData}
          onPaginationChanged={handlePaginationChanged}
        />
      </div>
      <FlexLayout
        align="center"
        justify="end"
        gap={3}
        style={{
          borderTop:
            "var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-secondary-borderColor)",
          paddingBlock: "var(--salt-spacing-100)",
          paddingInline: "var(--salt-spacing-100)",
        }}
      >
        <FlexLayout align="center" gap={1}>
          <Text styleAs="label">Page Size</Text>
          <Dropdown
            aria-label="Page Size"
            selected={[pageSize]}
            onSelectionChange={handlePageSizeChange}
            bordered
            style={{ width: "calc(var(--salt-size-base) * 3)" }}
          >
            {PAGE_SIZES.map((size) => (
              <Option value={size} key={size}>
                {size}
              </Option>
            ))}
          </Dropdown>
        </FlexLayout>
        <Text>{rangeLabel}</Text>
        {pageCount >= 2 && (
          <Pagination
            count={pageCount}
            page={page}
            onPageChange={handlePageChange}
          >
            <FlexLayout align="center" gap={0}>
              <Button
                appearance="transparent"
                aria-label="First Page"
                disabled={isOnFirstPage}
                onClick={() => {
                  gridApiRef.current?.paginationGoToFirstPage();
                }}
              >
                <FirstIcon aria-hidden />
              </Button>
              <CompactPaginator>
                <CompactInput />
              </CompactPaginator>
              <Button
                appearance="transparent"
                aria-label="Last Page"
                disabled={isOnLastPage}
                onClick={() => {
                  gridApiRef.current?.paginationGoToLastPage();
                }}
              >
                <LastIcon aria-hidden />
              </Button>
            </FlexLayout>
          </Pagination>
        )}
      </FlexLayout>
    </StackLayout>
  );
};

export default PaginationExample;
