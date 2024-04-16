export function getHrefFromComponent(component: string) {
  // Multiline Input -> multiline-input
  // Input -> input
  // File Drop Zone => file-drop-zone
  const tag = component.replaceAll(/ /g, "-").toLowerCase();
  return `/salt/components/${tag}`;
}
