import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// import { WindowRange, getFullRange } from '@vuu-ui/utils/src/range-utils';

// @ts-ignore
import { RemoteDataSource, Servers, useViewserver } from "@vuu-ui/data-remote";

// import GridContext from './grid-context';

export const metadataKeys = {
  IDX: 0,
  RENDER_IDX: 1,
  IS_LEAF: 2,
  IS_EXPANDED: 3,
  DEPTH: 4,
  COUNT: 5,
  KEY: 6,
  SELECTED: 7,
  count: 8,
  PARENT_IDX: "parent_idx",
  IDX_POINTER: "idx_pointer",
  FILTER_COUNT: "filter_count",
  NEXT_FILTER_IDX: "next_filter_idx",
};

export type VuuGridConfig = {
  bufferSize: number;
  columns: any[];
  serverName: string;
  tableName: { table: string; module: string };
  serverUrl: string;
  sort: any;
  aggregations: any;
  group: any;
  filter: any;
  filterQuery: any;
};

export class WindowRange {
  public from: number;
  public to: number;

  constructor(from: number, to: number) {
    this.from = from;
    this.to = to;
  }

  public isWithin(index: number) {
    return index >= this.from && index < this.to;
  }

  //find the overlap of this range and a new one
  public overlap(from: number, to: number): [number, number] {
    return from >= this.to || to < this.from
      ? [0, 0]
      : [Math.max(from, this.from), Math.min(to, this.to)];
  }

  public copy(): WindowRange {
    return new WindowRange(this.from, this.to);
  }
}

export interface VuuRange {
  lo?: number;
  hi?: number;
  from: number;
  to: number;
}

type PartialVuuRange =
  | VuuRange
  | {
      lo: number;
      hi: number;
      from?: number;
      to?: number;
    };

export interface FromToRange {
  from: number;
  to: number;
}

export function getFullRange(
  range: PartialVuuRange,
  bufferSize: number = 0,
  rowCount: number = Number.MAX_SAFE_INTEGER
): FromToRange {
  const lo: number = range.from !== undefined ? range.from : range.lo!;
  const hi: number = range.to !== undefined ? range.to : range.hi!;

  if (bufferSize === 0) {
    return { from: lo, to: Math.min(hi, rowCount) };
  } else if (lo === 0) {
    return { from: lo, to: Math.min(hi + bufferSize, rowCount) };
  } else {
    const rangeSize = hi - lo;
    const buff = Math.round(bufferSize / 2);
    const shortfallBefore = lo - buff < 0;
    const shortFallAfter = rowCount - (hi + buff) < 0;

    if (shortfallBefore && shortFallAfter) {
      return { from: 0, to: rowCount };
    } else if (shortfallBefore) {
      return { from: 0, to: rangeSize + bufferSize };
    } else if (shortFallAfter) {
      return {
        from: Math.max(0, rowCount - (rangeSize + bufferSize)),
        to: rowCount,
      };
    } else {
      return { from: lo - buff, to: hi + buff };
    }
  }
}

const { RENDER_IDX } = metadataKeys;

const byKey = (row1: any[], row2: any[]) => row1[RENDER_IDX] - row2[RENDER_IDX];

type DispatchGridAction = (message: any) => void;
type DispatchGridModelAction = (args: {
  type: string;
  columns?: any[];
  filter?: any;
  aggregations?: any;
  groupBy?: any;
}) => void;
type SubscriptionDetails = {
  range: any;
};
type GridModel = {
  renderBufferSize: number;
};
type ConfigChangeHandler = (config: Partial<VuuGridConfig>) => void;
type SizeChangeHandler = (size: number) => void;

//TODO allow subscription details to be set before subscribe call
export default function useDataSource(
  // These were in GridContext
  dataSource: RemoteDataSource,
  dispatchGridAction: DispatchGridAction,
  dispatchGridModelAction: DispatchGridModelAction,
  //
  subscriptionDetails: SubscriptionDetails,
  gridModel: GridModel,
  onConfigChange: ConfigChangeHandler,
  onSizeChange: SizeChangeHandler
) {
  // const { dataSource, dispatchGridAction, dispatchGridModelAction } =
  //   useContext(GridContext);
  const [, forceUpdate] = useState<any>(null);
  const isMounted = useRef<boolean>(true);
  const hasUpdated = useRef<boolean>(false);
  const rafHandle = useRef<number | null>(null);

  const dataWindow = useMemo(
    () =>
      new MovingWindow(
        getFullRange(subscriptionDetails.range, gridModel.renderBufferSize)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gridModel.renderBufferSize]
  );

  const setData = useCallback(
    (updates) => {
      //     onsole.log(`%c[useDataSource] setData
      // [${updates.map(d => d[0]).join(',')}]`,'color:blue')
      for (const row of updates) {
        dataWindow.add(row);
      }

      // WHy bother with the slixe ?
      data.current = dataWindow.data.slice().sort(byKey);
      //     onsole.log(`%c[useDataSource] data.current has ${data.current.length} records
      // [${data.current.map(d => d[0]).join(',')}]
      //     `, 'color:blue;')
      hasUpdated.current = true;
    },
    [dataWindow]
  );

  const datasourceMessageHandler = useCallback(
    (message) => {
      const { type, ...msg } = message;
      if (type === "subscribed") {
        dispatchGridModelAction({
          type: "set-available-columns",
          columns: msg.columns,
        });
        if (msg.filter) {
          dispatchGridModelAction({ type: "filter", filter: msg.filter });
        }
      } else if (type === "viewport-update") {
        const sizeChanged = msg.size !== undefined;
        if (sizeChanged) {
          onSizeChange(msg.size);
          dataWindow.setRowCount(msg.size);
        }
        if (msg.rows) {
          setData(msg.rows);
        } else if (sizeChanged) {
          // TODO is this roght ?s
          data.current = dataWindow.data.slice().sort(byKey);
          hasUpdated.current = true;
        }
      } else if (type === "sort") {
        const { sort } = msg;
        dispatchGridModelAction(message);
        onConfigChange({ sort });
      } else if (type === "aggregate") {
        const { aggregations } = msg;
        console.log(
          `[useDataSource] aggregations ACKED ${JSON.stringify(aggregations)}`
        );
        dispatchGridModelAction({ type: "set-aggregations", aggregations });
        onConfigChange({ aggregations });
      } else if (type === "groupBy") {
        const { groupBy } = msg;
        dispatchGridModelAction({ type: "group", groupBy });
        onConfigChange({ group: groupBy });
      } else if (type === "filter") {
        const { filter, filterQuery } = msg;
        dispatchGridModelAction(message);
        onConfigChange({ filter, filterQuery });
        dataSource.emit("filter", filter);
      } else {
        dispatchGridAction(message);
      }
    },
    [
      dataSource,
      dataWindow,
      dispatchGridAction,
      dispatchGridModelAction,
      onConfigChange,
      onSizeChange,
      setData,
    ]
  );

  useEffect(
    () => () => {
      if (rafHandle.current) {
        cancelAnimationFrame(rafHandle.current);
        rafHandle.current = null;
      }
      isMounted.current = false;
    },
    []
  );

  const refreshIfUpdated = useCallback(() => {
    if (isMounted.current) {
      if (hasUpdated.current) {
        forceUpdate({});
        hasUpdated.current = false;
      }
      rafHandle.current = requestAnimationFrame(refreshIfUpdated);
    }
  }, [forceUpdate]);

  useEffect(() => {
    rafHandle.current = requestAnimationFrame(refreshIfUpdated);
  }, [refreshIfUpdated]);

  const data = useRef<any[]>([]);

  const setRange = useCallback(
    (lo, hi) => {
      const { from, to } = getFullRange(
        { lo, hi },
        gridModel.renderBufferSize,
        dataSource.rowCount
      );
      // onsole.log(`[useDataSource] setRange ${lo} ${hi} > full range ${from} ${to}`)
      dataSource.setRange(from, to);
      dataWindow.setRange(from, to);
    },
    [dataSource, dataWindow, gridModel.renderBufferSize]
  );

  useEffect(() => {
    const { range, ...rest } = subscriptionDetails;
    const { from: lo, to: hi } = getFullRange(
      range,
      gridModel.renderBufferSize
    );
    dataSource.subscribe(
      {
        ...rest,
        range: { lo, hi },
      },
      datasourceMessageHandler
    );
  }, [
    dataSource,
    datasourceMessageHandler,
    gridModel.renderBufferSize,
    subscriptionDetails,
  ]);

  useEffect(
    () => () => {
      dataSource.unsubscribe();
    },
    [dataSource]
  );

  return [data.current, setRange, dataSource];
}

type MovingWindowDataItem = [number, number];

export class MovingWindow {
  public range: WindowRange;
  public data: MovingWindowDataItem[];
  public rowCount: number;

  constructor({ from, to }: { from: number; to: number }) {
    this.range = new WindowRange(from, to);
    //internal data is always 0 based, we add range.from to determine an offset
    this.data = new Array(to - from);
    this.rowCount = 0;
  }

  setRowCount = (rowCount: number): void => {
    if (rowCount < this.data.length) {
      this.data.length = rowCount;
    }
    this.rowCount = rowCount;
  };

  add(data: MovingWindowDataItem) {
    const [index] = data;
    if (this.isWithinRange(index)) {
      const internalIndex = index - this.range.from;
      this.data[internalIndex] = data;
    }
  }

  getAtIndex(index: number) {
    return this.range.isWithin(index) &&
      this.data[index - this.range.from] != null
      ? this.data[index - this.range.from]
      : undefined;
  }

  isWithinRange(index: number) {
    return this.range.isWithin(index);
  }

  setRange(from: number, to: number) {
    if (from !== this.range.from || to !== this.range.to) {
      const [overlapFrom, overlapTo] = this.range.overlap(from, to);
      const newData = new Array(to - from);
      for (let i = overlapFrom; i < overlapTo; i++) {
        const data = this.getAtIndex(i);
        if (data) {
          const index = i - from;
          newData[index] = data;
        }
      }
      this.data = newData;
      this.range.from = from;
      this.range.to = to;
    }
  }
}
