import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CloseIcon,
  DoubleChevronLeftIcon,
  DoubleChevronRightIcon,
  ErrorSolidIcon,
  FavoriteIcon,
  FavoriteSolidIcon,
  FavoriteStrongIcon,
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
import { ErrorAdornmentIcon } from "../status-adornment/ErrorAdornment";
import { SuccessAdornmentIcon } from "../status-adornment/SuccessAdornment";
import { WarningAdornmentIcon } from "../status-adornment/WarningAdornment";

export interface SemanticIconMap {
  ActiveIcon: ElementType;
  CalendarIcon: ElementType;
  CloseIcon: ElementType;
  CollapseGroupIcon: ElementType;
  CollapseIcon: ElementType;
  CollapseLeftIcon: ElementType;
  CollapseRightIcon: ElementType;
  CompletedIcon: ElementType;
  DecreaseIcon: ElementType;
  ErrorIcon: ElementType;
  ErrorStatusAdornment: ElementType;
  ExpandGroupIcon: ElementType;
  ExpandIcon: ElementType;
  ExternalIcon: ElementType;
  IncreaseIcon: ElementType;
  InfoIcon: ElementType;
  InProgressIcon: ElementType;
  LockedIcon: ElementType;
  LevelSeparatorIcon: ElementType;
  NextIcon: ElementType;
  OverflowIcon: ElementType;
  PendingIcon: ElementType;
  PreviousIcon: ElementType;
  RatingIcon: ElementType;
  RatingSelectedIcon: ElementType;
  RatingUnselectingIcon: ElementType;
  SuccessIcon: ElementType;
  SuccessStatusAdornment: ElementType;
  UploadIcon: ElementType;
  UserIcon: ElementType;
  WarningIcon: ElementType;
  WarningStatusAdornment: ElementType;
}

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
  ActiveIcon: StepActiveIcon,
  CalendarIcon: CalendarIcon,
  CloseIcon: CloseIcon,
  CollapseGroupIcon: ChevronDownIcon,
  CollapseIcon: ChevronUpIcon,
  CollapseLeftIcon: DoubleChevronLeftIcon,
  CollapseRightIcon: DoubleChevronRightIcon,
  CompletedIcon: SuccessCircleSolidIcon,
  DecreaseIcon: TriangleDownIcon,
  ErrorIcon: ErrorSolidIcon,
  ErrorStatusAdornment: ErrorAdornmentIcon,
  ExpandGroupIcon: ChevronRightIcon,
  ExpandIcon: ChevronDownIcon,
  ExternalIcon: TearOutIcon,
  IncreaseIcon: TriangleUpIcon,
  InfoIcon: InfoSolidIcon,
  InProgressIcon: ProgressInprogressIcon,
  LockedIcon: LockedIcon,
  LevelSeparatorIcon: ChevronRightIcon,
  NextIcon: ChevronRightIcon,
  OverflowIcon: OverflowMenuIcon,
  PendingIcon: StepDefaultIcon,
  PreviousIcon: ChevronLeftIcon,
  RatingIcon: FavoriteIcon,
  RatingSelectedIcon: FavoriteSolidIcon,
  RatingUnselectingIcon: FavoriteStrongIcon,
  SuccessIcon: SuccessCircleSolidIcon,
  SuccessStatusAdornment: SuccessAdornmentIcon,
  UploadIcon,
  UserIcon: UserSolidIcon,
  WarningIcon: WarningSolidIcon,
  WarningStatusAdornment: WarningAdornmentIcon,
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
