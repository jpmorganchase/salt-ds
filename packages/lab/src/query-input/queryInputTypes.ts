/**
 * @deprecated since 1.0.0-alpha.110. Follow the [search pattern](https://www.saltdesignsystem.com/salt/patterns/search) instead.
 */
export interface QueryInputCategory {
  name: string;
  values: string[];
}

/**
 * @deprecated since 1.0.0-alpha.110. Follow the [search pattern](https://www.saltdesignsystem.com/salt/patterns/search) instead.
 */
export interface QueryInputItem {
  category: string | null;
  value: string;
}
