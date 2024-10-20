import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CloseIcon,
  ErrorSolidIcon,
  InfoSolidIcon,
  OverflowMenuIcon,
  StepActiveIcon,
  StepDefaultIcon,
  StepSuccessIcon,
  SuccessTickIcon,
  TearOutIcon,
  TriangleDownIcon,
  TriangleUpIcon,
  UploadIcon,
  UserSolidIcon,
  WarningSolidIcon,
} from "@salt-ds/icons";
import {
  type ElementType,
  type ReactNode,
  createContext,
  useContext,
} from "react";

export type SemanticIconMap = {
  ExpandIcon: ElementType;
  CollapseIcon: ElementType;
  ExpandGroupIcon: ElementType;
  CollapseGroupIcon: ElementType;
  NextIcon: ElementType;
  PreviousIcon: ElementType;
  IncreaseIcon: ElementType;
  DecreaseIcon: ElementType;
  UploadIcon: ElementType;
  ErrorIcon: ElementType;
  SuccessIcon: ElementType;
  InfoIcon: ElementType;
  WarningIcon: ElementType;
  OverflowIcon: ElementType;
  UserIcon: ElementType;
  CalendarIcon: ElementType;
  CloseIcon: ElementType;
  ExternalIcon: ElementType;
  PendingIcon: ElementType;
  ActiveIcon: ElementType;
  CompletedIcon: ElementType;
};

export interface SemanticIconProviderProps {
  /**
   * Custom mapping of icon names to components. Overrides default icons if provided.
   */
  iconMap?: Partial<SemanticIconMap>;

  /**
   * Child elements that will use the provided icons.
   */
  children: ReactNode;
}

const defaultIconMap: SemanticIconMap = {
  ExpandIcon: ChevronDownIcon,
  CollapseIcon: ChevronUpIcon,
  ExpandGroupIcon: ChevronRightIcon,
  CollapseGroupIcon: ChevronDownIcon,
  NextIcon: ChevronRightIcon,
  PreviousIcon: ChevronLeftIcon,
  IncreaseIcon: TriangleUpIcon,
  DecreaseIcon: TriangleDownIcon,
  UploadIcon,
  ErrorIcon: ErrorSolidIcon,
  SuccessIcon: SuccessTickIcon,
  InfoIcon: InfoSolidIcon,
  WarningIcon: WarningSolidIcon,
  OverflowIcon: OverflowMenuIcon,
  UserIcon: UserSolidIcon,
  CalendarIcon: CalendarIcon,
  CloseIcon: CloseIcon,
  ExternalIcon: TearOutIcon,
  PendingIcon: StepDefaultIcon,
  ActiveIcon: StepActiveIcon,
  CompletedIcon: StepSuccessIcon,
};

const SemanticIconContext = createContext<SemanticIconMap>(defaultIconMap);

export const SemanticIconProvider = ({
  iconMap = {},
  children,
}: SemanticIconProviderProps) => (
  <SemanticIconContext.Provider value={{ ...defaultIconMap, ...iconMap }}>
    {children}
  </SemanticIconContext.Provider>
);

export const useIcon = () => {
  const context = useContext(SemanticIconContext);
  return context || defaultIconMap;
};
