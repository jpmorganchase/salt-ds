import {
  randomAmount,
  randomCurrency,
  randomFlag,
  randomPercentage,
  randomSide,
  randomStatus,
  randomString,
  randomText,
} from "./utils";

export interface BlotterRecord {
  key: string;
  identifier: string;
  flag: string;
  side: string;
  attributes: string[];
  time: Date;
  quantity: number;
  averagePx: number;
  client: string;
  date: Date;
  deskOwner: string;
  exec: number;
  instruction: string;
  progress: number;
  status: string;
  currency: string;

  records?: BlotterRecord[];
  isExpanded?: boolean;
  level?: number;
}

export class Blotter {
  public records: BlotterRecord[] = [];
  public visibleRecords: BlotterRecord[] = [];
  public recordsByKey: Map<string, BlotterRecord> = new Map();

  public constructor() {
    // TODO
  }

  public addRecord(record: BlotterRecord, parent?: BlotterRecord) {
    record.level = parent ? parent.level! + 1 : 0;
    if (parent) {
      if (!parent.records) {
        parent.records = [record];
      } else {
        parent.records.push(record);
      }
    } else {
      this.records.push(record);
    }
    this.recordsByKey.set(record.key, record);
    this.updateVisibleRecords();
  }

  private updateVisibleRecords() {
    this.visibleRecords = [];
    this.addRecordsToVisible(this.records);
  }

  private addRecordsToVisible(records: BlotterRecord[]) {
    for (let record of records) {
      this.visibleRecords.push(record);
      if (record.isExpanded) {
        this.addRecordsToVisible(record.records!);
      }
    }
  }

  public expandCollapse(record: BlotterRecord) {
    record.isExpanded = !record.isExpanded;
    this.updateVisibleRecords();
  }
}

export function makeFakeBlotterRecord(): BlotterRecord {
  const identifierText = randomString(10).toUpperCase();
  return {
    identifier: identifierText,
    attributes: [],
    client: randomText(2, 4, 12),
    date: new Date(),
    averagePx: randomAmount(),
    exec: randomPercentage(),
    deskOwner: randomString(15),
    instruction: randomText(5, 2, 8),
    key: identifierText,
    flag: randomFlag(),
    status: randomStatus(),
    progress: Math.random() * 100,
    quantity: Math.floor(Math.random() * 100),
    side: randomSide(),
    time: new Date(),
    currency: randomCurrency(),
  };
}
