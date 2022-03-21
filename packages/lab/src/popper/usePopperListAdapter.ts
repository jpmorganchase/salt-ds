import { useEffect, useState } from "react";
import {
  flip,
  size,
  useFloating,
  getScrollParents,
} from "@floating-ui/react-dom";
import { isElectron } from "../window/electron-utils";

export const usePopperListAdapter = (isOpen: boolean) => {
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);

  const middleware = [];
  if (!isElectron) {
    middleware.push(
      flip({
        fallbackPlacements: ["bottom-start", "top-start"],
      }),
      size({
        apply({ height }) {
          setMaxHeight(height);
        },
      })
    );
  }
  const { reference, floating, placement, update, refs } = useFloating({
    middleware: middleware,
    placement: "bottom-start",
  });

  useEffect(() => {
    if (!refs.reference.current || !refs.floating.current) {
      return;
    }

    update();

    const parents = [
      ...getScrollParents(refs.reference.current),
      ...getScrollParents(refs.floating.current),
    ];
    parents.forEach((parent) => {
      parent.addEventListener("scroll", update);
      parent.addEventListener("resize", update);
    });
    return () => {
      parents.forEach((parent) => {
        parent.removeEventListener("scroll", update);
        parent.removeEventListener("resize", update);
      });
    };
  }, [refs.reference, refs.floating, update, isOpen]);

  return [reference, floating, placement, maxHeight] as const;
};
