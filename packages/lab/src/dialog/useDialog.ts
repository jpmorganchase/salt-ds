import {
  useClick,
  useDismiss,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { useFloatingUI, UseFloatingUIProps } from "@salt-ds/core";

export type UseDialogProps = Partial<
  Pick<UseFloatingUIProps, "onOpenChange" | "open">
>;

export function useDialog(props: UseDialogProps) {
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
