# @salt-ds/icons

## 1.17.0

### Minor Changes

- f3a0eea: - Updated `FavoriteIcon` and `FavoriteSolidIcon`.
  - Added `FavoriteHalfIcon` and `FavoriteStrongIcon`
- fcc4021: - Added `NotAllowedIcon`
  - Deprecated `ErrorExecuteIcon`. `NotAllowedIcon` should be used instead.

## 1.16.0

### Minor Changes

- 0c664ed: - Added `FigmaIcon`.
  - Deprecated `IconFigmaIcon`. `FigmaIcon` should be used instead.
- ee16c19: Deprecated `BarChartIcon`, `PieChartIcon` and `LineChartIcon`. `ChartBarIcon`, `ChartPieIcon` and `ChartLineIcon` should be used instead.
- ee16c19: Added new chart icons:

  - `ChartAreaIcon`
  - `ChartBarIcon`
  - `ChartBoxPlotIcon`
  - `ChartBubbleIcon`
  - `ChartBubbleSolidIcon`
  - `ChartBulletIcon`
  - `ChartCandlestickIcon`
  - `ChartCandlestickSolidIcon`
  - `ChartColumnIcon`
  - `ChartDonutIcon`
  - `ChartLineIcon`
  - `ChartLineSolidIcon`
  - `ChartPieIcon`
  - `ChartPieSolidIcon`
  - `ChartScatterIcon`
  - `ChartScatterSolidIcon`
  - `ChartStackedBarIcon`
  - `ChartWaterfallIcon`

## 1.15.0

### Minor Changes

- d6dc07b: Deprecated ListIcon. TextUnorderedListIcon should be used instead.
- d6dc07b: As part of our ongoing commitment to ensure greater consistency and legibility across applications, we have refined the stroke weight of two icons:

  - AddIcon
  - RemoveIcon

- d6dc07b: Added 42 new icons designed to address common use cases in mathematical operations, document management, messaging, and text formatting:

  - ScheduleIcon
  - CollapseAllHorizontalIcon
  - ExpandAllHorizontalIcon
  - DivideIcon
  - DoesNotEqualIcon
  - EqualIcon
  - ExponentiationIcon
  - GreaterThanIcon
  - GreaterThanEqualTo
  - InfiniteIcon
  - LessThanIcon
  - LessThanEqualTo
  - MultiplyIcon
  - PercentageIcon
  - PiIcon
  - SquareRootIcon
  - MessageForwardIcon
  - MessageReplyIcon
  - MessageReplyAllIcon
  - PanelCloseLeftIcon
  - PanelCloseRightIcon
  - PanelOpenLeftIcon
  - PanelOpenRightIcon
  - PanelCloseBottomIcon
  - PanelCloseTopIcon
  - PanelOpenBottomIcon
  - PanelOpenTopIcon
  - SplitViewIcon
  - TextOrderedListIcon
  - TextUnorderedListIcon
  - DocumentDraft
  - DocumentEdit
  - TextAlignCenterIcon
  - TextAlignJustifyIcon
  - TextAlignLeftIcon
  - TextAlignRightIcon
  - TextBoldIcon
  - TextColorIcon
  - TextHighlightIcon
  - TextItalicsIcon
  - TextStrikethroughIcon
  - TextUnderlineIcon
  - StopIcon

## 1.14.0

### Minor Changes

- dd3e21d: Updated 12 existing icons to improve stroke weight and arrow-head consistency:

  - ChevronDownIcon
  - ChevronLeftIcon
  - ChevronRightIcon
  - ChevronUpIcon
  - CloseIcon
  - ListIcon
  - PlaceInIcon
  - RestoreIcon
  - SortAscendIcon
  - SortDescendIcon
  - SwapIcon
  - TearOutIcon

  Added 53 new icons based on community contributions and suggestions:

  - AddToGridIcon
  - AddToGridSolidIcon
  - AddUserIcon
  - AnnouncementIcon
  - CompareIcon
  - CompareSolidIcon
  - CurrencyIcon
  - CurrencySolidIcon
  - CurrencyExchangeIcon
  - DatasetIcon
  - DatasetManagerIcon
  - DatasetManagerSolidIcon
  - DocumentSearchIcon
  - FeedbackIcon
  - FeedbackSolidIcon
  - FirstIcon
  - GrowthIcon
  - HandshakeIcon
  - HandshakeSolidIcon
  - HierarchyIcon
  - HierarchySolidIcon
  - HolidayIcon
  - HolidaySolidIcon
  - IndentIcon
  - LastIcon
  - LightbulbIcon
  - LightbulbSolidIcon
  - LikeIcon
  - LikeSolidIcon
  - LinkedinIcon
  - LinkedinSolidIcon
  - MagicWandIcon
  - MaintenanceIcon
  - MaintenanceSolidIcon
  - OutdentIcon
  - PieChartIcon
  - PolicyIcon
  - RemoveUserIcon
  - SchoolIcon
  - SchoolSolidIcon
  - SignatureIcon
  - SlideIcon
  - SlideSolidIcon
  - SortIcon
  - SparkleRefreshIcon
  - SparkleRefreshSolidIcon
  - SummarizeIcon
  - TravelIcon
  - TravelSolidIcon
  - UrgencyOntimeIcon
  - UserSearchIcon
  - WorkflowIcon
  - WorkflowSolidIcon

## 1.13.2

### Patch Changes

- 021e90d: Fixed hidden icons being announced on iOS.

## 1.13.1

### Patch Changes

- 0a5b68b: Marked CSS files as having side effects. This fixes Webpack tree-shaking CSS files when `sideEffects: true` is not set on style-loader rules.

## 1.13.0

### Minor Changes

- dc5b3b3: Added new icons

  - Checkmark
  - CheckmarkSolid
  - SuccessCircle
  - SuccessCircleSolid

  Updated below icons to align with other icons

  - Error
  - ErrorSolid
  - Info
  - InfoSolid
  - Warning
  - WarningSolid

  Deprecated below icons

  | Deprecated            | Replacement        |
  | --------------------- | ------------------ |
  | SuccessSmallIcon      | CheckmarkIcon      |
  | SuccessSmallSolidIcon | CheckmarkSolidIcon |
  | SuccessIcon           | CheckmarkIcon      |
  | SuccessSolidIcon      | CheckmarkSolidIcon |
  | StepSuccessIcon       | SuccessCircleIcon  |
  | SuccessTickIcon       | CheckmarkIcon      |

  Closes #4347

## 1.12.1

### Patch Changes

- 89c26bc: Fixed Icon as CSS background not working when another className is in front. Closes #3583.

## 1.12.0

### Minor Changes

- f44fe1eb: Updated icons with arrows to be more consistent:

  - Inbox
  - InboxSolid
  - MoveAll
  - MoveHorizontal
  - MoveVertical

  Added:

  - MaximizeSolid
  - Sparkle
  - SparkleSolid

## 1.11.2

### Patch Changes

- 298ec90c: Fixed `saltIcons.css` not being shipped as part of the package.
  Fixed CSS icons not appearing.

## 1.11.1

### Patch Changes

- d1505a32: Reexporting all the icons from Figma. This has caused the following:

  - The "9" in the `SortNumAscendIcon` is no longer cut off.
  - The arrow in the `PlaceInIcon` is no longer too short.
  - The `SaltShakerIcon` and `SaltShakerSolidIcon` have the correct viewport and are now slightly bigger.
  - The waves in the `SignalIcon` are now visible.
  - The arrow in the `TearOutIcon` is no longer too short.

## 1.11.0

### Minor Changes

- ef0b7578: Updated:

  - ArrowDown
  - ArrowLeft
  - ArrowRight
  - ArrowUp
  - ClosedcaptionDisabled
  - Download
  - Export
  - ExportSolid
  - Hidden
  - Import
  - ImportSolid
  - Redo
  - Refresh
  - Undo
  - Upload

  Added:

  - Boolean
  - BooleanSolid
  - ClosedcaptionDisabledSolid
  - CloudDisabled
  - CloudDisabledSolid
  - CloudDownload
  - CloudDownloadSolid
  - CloudSuccess
  - CloudSuccessSolid
  - CloudSync
  - CloudSyncSolid
  - CloudUpload
  - CloudUploadSolid
  - Collapse
  - Headphones
  - HeadphonesDisabled
  - HeadphonesDisabledSolid
  - HeadphonesSolid
  - HiddenSolid
  - History
  - IconFigma
  - Microphone
  - MicrophoneDisabled
  - MicrophoneDisabledSolid
  - MicrophoneSolid
  - Music
  - MusicDisabled
  - MusicDisabledSolid
  - MusicSolid
  - SemanticDissatisfied
  - SemanticDissatisfiedSolid
  - SemanticNeutral
  - SemanticNeutralSolid
  - SemanticSatisfied
  - SemanticSatisfiedSolid
  - SemanticVeryDissatisfied
  - SemanticVeryDissatisfiedSolid
  - SemanticVerySatisfied
  - SemanticVerySatisfiedSolid
  - Signal
  - StringNumber
  - StringText
  - Sync
  - Waveform
  - Wifi
  - WifiDisabled

## 1.10.0

### Minor Changes

- 1bff6291: Added `saltIcons.css` with all icon SVGs as background images.

  ```js
  import "@salt-ds/icons/saltIcons.css";

  const Example = () => {
    const iconName = "AddDocument";
    return <div className={`saltIcon-${iconName}`} />;
  };
  ```

## 1.9.1

### Patch Changes

- f7fcbd11: Fixed issue where components are not injecting their styles.

## 1.9.0

### Minor Changes

- b9831e3e: Added:

  - DragRowIcon
  - JigsawIcon
  - JigsawSolidIcon
  - LayersIcon
  - LayersSolidIcon
  - TypeIcon
  - TypeSolidIcon

## 1.8.0

### Minor Changes

- 02815995: Expose a CSS file that allows Salt to be used without runtime CSS injection.

  ```tsx
  import "@salt-ds/icons/css/salt-icon.css";
  ```

## 1.7.0

### Minor Changes

- e63fb3e4: Add a `color` prop to Icon.

  This can be used to specify the color used by Icon and supports: primary, secondary and inherit. The default value is "inherit".

  ```tsx
  <HomeIcon color="primary" />
  <UserIcon color="secondary" />
  <CloseIcon color="inherit" />
  ```

  _Note:_ This changes the default icon color from secondary to primary due to it inheriting the default text style. The previous default of secondary was an error.

## 1.6.0

### Minor Changes

- 48b09972: Added:

  - Scales
  - ScalesSolid
  - SortAscend
  - SortDescend
  - Weight
  - WeightSolid

- a4ebd655: Added:

  - Group
  - GroupSolid
  - Ungroup
  - UngroupSolid

## 1.5.1

### Patch Changes

- abfc4364: Corrected the minimum supported version of React. It has been updated to 16.14.0 due to the support for the new [JSX transform](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)

## 1.5.0

### Minor Changes

- 1ba2f407: Added:

  - Bank
  - BankSolid
  - Battery
  - BatterySolid
  - Browser
  - BrowserSolid
  - Devices
  - DevicesSolid
  - Display
  - DisplaySolid
  - Laptop
  - LaptopSolid
  - Mobile
  - MobileSolid
  - Mouse
  - MouseSolid
  - NotificationRead
  - NotificationReadSolid
  - Receipt
  - ReceiptSolid
  - SaltShaker
  - SaltShakerSolid
  - SortableAlpha
  - SortableNum
  - Watch
  - WatchSolid

## 1.4.0

### Minor Changes

- f166e777: Added:

  - CollapseAll
  - ExpandAll

- d78ff537: Refactored all components to use new style injection mechanism provided by `@salt-ds/styles`

## 1.3.1

### Patch Changes

- 1e9ef1a2: Fix duplicate Salt libraries being installed when multiple libraries are installed

## 1.3.0

### Minor Changes

- ea857f24: Deprecated `--salt-size-icon-base`, replaced with `--salt-icon-size-base`
  Added `--salt-icon-size-status-adornment`

## 1.2.0

### Minor Changes

- b1ab81f6: New icons available

  - Accessible
  - Cart
  - Crops
  - Github
  - Hospital
  - Man
  - Man woman
  - Map
  - Marker
  - Medical kit
  - Picnic
  - Pot food
  - Signpost
  - Stethoscope
  - Storefront
  - Success
  - Tote
  - Universal access
  - Utensils
  - Woman
  - Woodland

## 1.1.0

### Minor Changes

- edb17def: Add:

  - SearchSolid
  - SendSolid

  Edit:

  - AddDocument
  - AddDocumentSolid
  - ArrowDown
  - ArrowLeft
  - ArrowRight
  - ArrowUp
  - Attach
  - BarChart
  - Building
  - Chat
  - ChatSolid
  - Csv
  - CsvSolid
  - Dashboard
  - DashboardSolid
  - Delete
  - DeleteSolid
  - Document
  - DocumentSolid
  - DoubleChevronLeft
  - DoubleChevronRight
  - DoubleChevronUp
  - Edit
  - EditSolid
  - Expand
  - Export
  - ExportSolid
  - Flag
  - FlagSolid
  - GuideClosed
  - GuideClosedSolid
  - GuideOpen
  - Hidden
  - Home
  - HomeSolid
  - Image
  - ImageSolid
  - Import
  - ImportSolid
  - Key
  - Linked
  - List
  - Loader
  - Menu
  - Message
  - MessageSolid
  - MicroMenu
  - Minimize
  - MoveAll
  - MoveHorizontal
  - MoveVertical
  - Note
  - NoteSolid
  - Notification
  - NotificationSolid
  - Paste
  - PasteSolid
  - Pause
  - PauseSolid
  - Pdf
  - PdfSolid
  - Pin
  - PinSolid
  - Play
  - PlaySolid
  - Presentation
  - PresentationSolid
  - PriceLadder
  - Protection
  - ProtectionSolid
  - Redo
  - Remove
  - RemoveDocument
  - RemoveDocumentSolid
  - RunReport
  - RunReportSolid
  - ScheduleTime
  - ScheduleTimeSolid
  - Search
  - Send
  - Settings
  - SettingsSolid
  - Stackoverflow
  - Storage
  - StorageSolid
  - Sum
  - SumSolid
  - Symphony
  - Tree
  - TreeSolid
  - TriangleDown
  - TriangleLeft
  - TriangleRight
  - TriangleRightDown
  - TriangleUp
  - Undo
  - Unlinked
  - UserAdmin
  - UserAdminSolid
  - UserGroup
  - UserGroupSolid
  - Visible
  - VisibleSolid
  - VolumeUp
  - Xls
  - XlsSolid
  - Zip
  - ZipSolid

## 1.0.0

### Major Changes

- c1bc7479: Salt is the J.P. Morgan design system, an open-source solution for building exceptional products and digital experiences in financial services and other industries. It offers you well-documented, accessible components as well as comprehensive design templates, style libraries and assets.

  With this initial release we're providing:

  - AG Grid Theme
  - Border Layout
  - Button
  - Data Grid
  - Flex Layout
  - Flow Layout
  - Grid Layout
  - Icon
  - Link
  - Salt Provider
  - Stack Layout
  - Status Indicator
  - Text
  - Theme

  And a number of other lab components.
