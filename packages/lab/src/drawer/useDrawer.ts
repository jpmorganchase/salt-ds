import {
  useClick,
  useDismiss,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { useFloatingUI, UseFloatingUIProps } from "@salt-ds/core";

export type UseDrawerProps = Partial<
  Pick<UseFloatingUIProps, "onOpenChange" | "open">
>;

export function useDrawer(props: UseDrawerProps) {
  const { open, onOpenChange } = props;

  const { context, floating } = useFloatingUI({
    open,
    onOpenChange,
  });

  const click = useClick(context);
  const role = useRole(context);
  const dismiss = useDismiss(context);

  const { getFloatingProps, getReferenceProps } = useInteractions([
    role,
    dismiss,
    click,
  ]);

  return {
    getFloatingProps,
    getReferenceProps,
    floating,
    context,
  };
}
