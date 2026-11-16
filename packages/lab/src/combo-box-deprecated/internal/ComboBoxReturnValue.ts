type OptionalPropsWithUndefined<Props> = {
  [Key in keyof Props]: Pick<Props, Key> extends Required<Pick<Props, Key>>
    ? Props[Key]
    : Props[Key] | undefined;
};

/** Keep the deprecated hooks' optional prop values explicit in emitted types. */
export type ComboBoxReturnValue<Result, Props extends keyof Result> = {
  [Key in keyof Result]: Key extends Props
    ? OptionalPropsWithUndefined<Result[Key]>
    : Result[Key];
};
