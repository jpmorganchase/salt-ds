import {
  forwardRef,
  HTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { makePrefixer, useControlled } from "@jpmorganchase/uitk-core";
import "./Accordion.css";
import cn from "classnames";
import { AccordionContext } from "./AccordionContext";

const withBaseName = makePrefixer("uitkAccordion");

export interface AccordionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  disabled?: boolean;
  maxExpandedItems?: number;
  expandedSectionIds?: string[];
  defaultExpandedSectionIds?: string[];
  // expandedSectionIds in the order they were expanded.
  // The oldest expanded item is the first in this list.
  // When maxExpandedItems is reached, the first item in this list is the first to be collapsed
  onChange?: (expandedSectionIds: string[] | null) => void;
}

function sliceToSize<T>(items?: T[], size?: number) {
  if (size !== undefined) {
    const cutOffCount = items ? items.length - size : 0;
    if (cutOffCount > 0) {
      items = items!.slice(cutOffCount);
    }
  }
  return items;
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  function Accordion(
    {
      disabled = false,
      expandedSectionIds: expandedSectionIdsProp,
      defaultExpandedSectionIds = [],
      maxExpandedItems,
      onChange: onChangeProp,
      className,
      children,
      ...restProps
    },
    ref
  ) {
    const [sectionIds, setSectionIds] = useState<Set<string>>(new Set());

    const [expandedSectionIds, setExpandedSectionIds] = useControlled<string[]>(
      {
        controlled: expandedSectionIdsProp,
        default: defaultExpandedSectionIds,
        name: "Accordion",
        state: "ExpandedSectionIds",
      }
    );

    const registerSection = useCallback(
      (sectionId: string, isExpanded: boolean) => {
        if (!sectionId) {
          debugger;
        }
        console.log(
          `Section "${sectionId}" registered as ${
            isExpanded ? "expanded" : "collapsed"
          }`
        );
        setSectionIds((sectionIds) => {
          const newSectionIds = new Set(sectionIds);
          newSectionIds.add(sectionId);
          return newSectionIds;
        });
        if (isExpanded) {
          setExpandedSectionIds((oldExpandedSectionIds) => {
            const newExpandedSectionIds = [...oldExpandedSectionIds];
            newExpandedSectionIds.push(sectionId);
            return newExpandedSectionIds;
          });
        }
      },
      []
    );

    const unregisterSection = useCallback((sectionId: string) => {
      console.log(`Section "${sectionId}" unregistered`);
      if (expandedSectionIds.includes(sectionId)) {
        setExpandedSectionIds((oldValue) =>
          oldValue.filter((id) => id !== sectionId)
        );
      }
      setSectionIds((sectionIds) => {
        const newSectionIds = new Set(sectionIds);
        newSectionIds.delete(sectionId);
        return newSectionIds;
      });
    }, []);

    useEffect(() => {
      if (
        expandedSectionIds &&
        maxExpandedItems !== undefined &&
        expandedSectionIds.length > maxExpandedItems
      ) {
        const newExpandedSectionIds = sliceToSize(
          expandedSectionIds,
          maxExpandedItems
        );
        setExpandedSectionIds(newExpandedSectionIds || []);
        if (onChangeProp) {
          onChangeProp(newExpandedSectionIds || null);
        }
      }
    }, [maxExpandedItems]);

    const onChange = useCallback(
      (sectionId: string, isExpanded: boolean) => {
        let newExpandedSectionIds = [...expandedSectionIds];
        if (isExpanded) {
          newExpandedSectionIds.push(sectionId);
          if (
            maxExpandedItems != null &&
            newExpandedSectionIds.length > maxExpandedItems
          ) {
            newExpandedSectionIds.shift();
          }
        } else {
          newExpandedSectionIds = newExpandedSectionIds.filter(
            (id) => id !== sectionId
          );
        }
        setExpandedSectionIds(newExpandedSectionIds);
        if (onChangeProp) {
          onChangeProp(newExpandedSectionIds);
        }
      },
      [expandedSectionIds, onChangeProp]
    );

    const isExpanded = useCallback(
      (sectionId: string) => expandedSectionIds.includes(sectionId),
      [expandedSectionIds]
    );

    const contextValue: AccordionContext = useMemo(() => {
      return {
        registerSection,
        unregisterSection,
        onChange,
        isExpanded,
        disabled,
      };
    }, [registerSection, unregisterSection, onChange, isExpanded, disabled]);

    return (
      <div className={cn(withBaseName(), className)} {...restProps} ref={ref}>
        <AccordionContext.Provider value={contextValue}>
          {children}
        </AccordionContext.Provider>
      </div>
    );
  }
);
