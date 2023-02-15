export type BpType = Record<string, number>;

export type BreakpointsOrder<BP extends BpType> = BP;

export type Breakpoint<BP extends BpType> = keyof BP;

export type OrderedBreakpoints<BP extends BpType> = Breakpoint<BP>[];

export type BreakpointsContextType<BP extends BpType> = {
  breakpoints: BP;
  breakpointOrder: BreakpointsOrder<BP>;
  currentBreakpoint: Breakpoint<BP>;
  orderedBreakpoints: OrderedBreakpoints<BP>;
};

export type ResponsiveProp<V extends unknown, BP extends BpType> = {
  default: V;
} & Partial<{
  [K in keyof BP]: V;
}>;

export type ResponsiveProps<
  Props extends Record<string, unknown>,
  BP extends BpType
> = {
  [K in keyof Props]: ResponsiveProp<Props[K], BP> | Props[K];
};
