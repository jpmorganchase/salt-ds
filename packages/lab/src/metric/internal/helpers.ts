/**
 * This function only capitalise the first letter of a string.
 */
export function capitalise(value: string): string {
  return value.length > 0 ? value[0].toUpperCase() + value.slice(1) : value;
}
