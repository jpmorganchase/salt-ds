import { useEffect, useRef } from "react";

const positiveLookUp = [
  '[aria-live="polite"]',
  '[aria-live="assertive"]',
  '[role="alert"]',
  '[role="log"]',
  '[role="status"]',
];

const negativeLookUp = ['[aria-live="off"]'];

const walkTheDOM = (node: Element, handler: (node: Element) => void) => {
  if (node.nodeType === 1) {
    handler(node);
    if (node.children.length) {
      for (const childNode of node.children) {
        walkTheDOM(childNode, handler);
      }
    }
  }
};

export function AnnouncementListener(props: {
  onAnnouncement?: (announcement: string) => void;
}) {
  const { onAnnouncement } = props;
  const handleAnnouncement: MutationCallback = (mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "attributes") {
        const regionNode = mutation.target as HTMLElement;
        // if (regionNode.innerText) {
        onAnnouncement?.(regionNode.innerText);
        // }
      }
    }
  };
  const obs = useRef(new MutationObserver(handleAnnouncement));

  useEffect(() => {
    document.querySelectorAll(positiveLookUp.join(",")).forEach((node) => {
      if (!node.matches(negativeLookUp.join(","))) {
        obs.current.observe(node, {
          attributes: true,
          subtree: true,
          childList: true,
          characterData: true,
        });
      }
    });
  }, []);

  useEffect(() => {
    const observer = obs.current;
    return () => {
      observer.disconnect();
    };
  });

  return null;
}
