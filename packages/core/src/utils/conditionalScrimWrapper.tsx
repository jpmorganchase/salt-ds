import { Scrim } from "../scrim";

interface ConditionalScrimWrapperProps extends React.PropsWithChildren {
  condition: boolean;
}

export const ConditionalScrimWrapper = ({
  condition,
  children,
}: ConditionalScrimWrapperProps) => {
  return condition ? <Scrim fixed> {children} </Scrim> : <>{children} </>;
};
