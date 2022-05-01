/**
 * "--uitk-color-red-10" => "color"
 */
export function getIdFromPropertyName(name: string): string {
  const removePrefix = name.replace("--", "").replace("uitk-", "");
  const indexOfDash = removePrefix.indexOf("-");
  return removePrefix.substring(
    0,
    indexOfDash > 0 ? indexOfDash : removePrefix.length - 1
  );
}
