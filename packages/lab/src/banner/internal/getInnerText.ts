export default function getInnerText(element: HTMLElement): string {
  let innerText = "";
  if (element) {
    innerText = element.innerText;
  }
  return innerText.replace(/(\r?\n)/gm, " ").trim();
}
