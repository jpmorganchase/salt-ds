import { createContext, useContext } from "react";

const PropsContext = createContext<Record<string, any> | undefined>(undefined);

export function DefaultPropsProvider({
  value,
  children,
}: React.PropsWithChildren<{ value: Record<string, any> | undefined }>) {
  return (
    <PropsContext.Provider value={value}>{children}</PropsContext.Provider>
  );
}

export function useDefaultProps({
  name,
  props = {},
}: { name: string; props: any }) {
  const ctx = useContext(PropsContext) || {};
  if (Object.prototype.hasOwnProperty.call(ctx, name)) {
    return { ...ctx[name], ...props };
  }
  return props;
}
