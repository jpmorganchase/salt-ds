export interface QueryInputCategory {
  name: string;
  values: string[];
}

export interface QueryInputItem {
  category: string | null;
  value: string;
}
