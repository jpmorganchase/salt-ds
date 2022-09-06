export default function getInnerText(element: HTMLElement): string {
  let innerText = "";

  if (element) {
    const slots = element.querySelectorAll("slot");
    if (slots.length > 0) {
      const slotArray = Array.from(slots);
      innerText = slotArray.reduce<string>(
        (content: string, slot) =>
          content.concat(
            `${
              (slot.assignedElements({ flatten: true }) as HTMLElement[])[0]
                .innerText
            } `
          ),
        ""
      );
    } else {
      innerText = element.innerText || "";
    }
  }
  return innerText.replace(/(\r\n|\n|\r)/gm, " ").trim();
}
