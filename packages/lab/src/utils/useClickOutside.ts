import { useRef, useEffect, Ref } from "react";

const defaultTriggerEvents: MouseEvents[] = ["mousedown"];

type MouseEvents = keyof {
  [K in keyof GlobalEventHandlersEventMap as GlobalEventHandlersEventMap[K] extends MouseEvent
    ? K
    : never]: GlobalEventHandlersEventMap[K];
};

export function useClickOutside<Element extends HTMLElement>(
  handler: () => void,
  triggerEvents?: MouseEvents[],
  containers?: HTMLElement[]
): Ref<Element> {
  const ref = useRef<Element>(null);

  useEffect(() => {
    const handleEvent = (event: MouseEvent) => {
      if (Array.isArray(containers)) {
        const shouldCallHandler = containers.every((node) => {
          return !node?.contains(event.target as Node);
        });
        shouldCallHandler && handler();
      } else if (!ref.current?.contains(event.target as Node)) {
        handler();
      }
    };

    const events = triggerEvents ?? defaultTriggerEvents;

    events.forEach((event) => {
      document.addEventListener(event, handleEvent);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleEvent);
      });
    };
  }, [handler, containers, triggerEvents]);

  return ref;
}
