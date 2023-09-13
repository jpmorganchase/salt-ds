import { ReactElement } from "react";
import { Icon, IconProps } from "@salt-ds/icons";

export const CustomIcon = (): ReactElement => {
  return (
    <Icon aria-label="custom icon" viewBox="0 0 18 18" size={2}>
      <path d="M16,2V16H2V2Zm.5-1H1.5a.5.5,0,0,0-.5.5v15a.5.5,0,0,0,.5.5h15a.5.5,0,0,0,.5-.5V1.5A.5.5,0,0,0,16.5,1Z" />
      <rect height="4" rx="0.25" width="12" x="3" y="11" />
    </Icon>
  );
};
