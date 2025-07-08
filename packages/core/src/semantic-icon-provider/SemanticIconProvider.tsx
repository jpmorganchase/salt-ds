import {
  CalendarIcon,
  CheckmarkIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CloseIcon,
  ErrorSolidIcon,
  InfoSolidIcon,
  LockedIcon,
  OverflowMenuIcon,
  ProgressInprogressIcon,
  StepActiveIcon,
  StepDefaultIcon,
  SuccessCircleSolidIcon,
  TearOutIcon,
  TriangleDownIcon,
  TriangleUpIcon,
  UploadIcon,
  UserSolidIcon,
  WarningSolidIcon,
} from "@salt-ds/icons";
import {
  createContext,
  type ElementType,
  type ReactNode,
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
  LockedIcon: ElementType;
  InProgressIcon: ElementType;
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
  SuccessIcon: CheckmarkIcon,
  InfoIcon: InfoSolidIcon,
  WarningIcon: WarningSolidIcon,
  OverflowIcon: OverflowMenuIcon,
  UserIcon: UserSolidIcon,
  CalendarIcon: CalendarIcon,
  CloseIcon: CloseIcon,
  ExternalIcon: TearOutIcon,
  PendingIcon: StepDefaultIcon,
  ActiveIcon: StepActiveIcon,
  CompletedIcon: SuccessCircleSolidIcon,
  LockedIcon: LockedIcon,
  InProgressIcon: ProgressInprogressIcon,
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
