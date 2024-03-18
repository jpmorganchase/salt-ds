import { ReactElement } from "react";
import { Button, Text, Toast, ToastContent } from "@salt-ds/core";
import {
  CloseIcon,
  FilterClearIcon,
  GlobeIcon,
  SaltShakerIcon,
  TailsIcon,
} from "@salt-ds/icons";

export const CustomIcon = (): ReactElement => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <Toast style={{ width: 260 }} Icon={FilterClearIcon}>
      <ToastContent>
        <Text>
          <strong>Info with Custom Icon</strong>
        </Text>
        <div>Filters have been cleared</div>
      </ToastContent>
      <Button variant="secondary">
        <CloseIcon />
      </Button>
    </Toast>
    <Toast style={{ width: 260 }} Icon={GlobeIcon} status={"success"}>
      <ToastContent>
        <Text>
          <strong>Success with Custom Icon</strong>
        </Text>
        <div>The world is connected</div>
      </ToastContent>
      <Button variant="secondary">
        <CloseIcon />
      </Button>
    </Toast>
    <Toast style={{ width: 260 }} Icon={SaltShakerIcon} status={"warning"}>
      <ToastContent>
        <Text>
          <strong>Warning with Custom Icon</strong>
        </Text>
        <div>There is not enough seasoning</div>
      </ToastContent>
      <Button variant="secondary">
        <CloseIcon />
      </Button>
    </Toast>
    <Toast style={{ width: 260 }} Icon={TailsIcon} status={"error"}>
      <ToastContent>
        <Text>
          <strong>Error with Custom Icon</strong>
        </Text>
        <div>There is a wild animal here</div>
      </ToastContent>
      <Button variant="secondary">
        <CloseIcon />
      </Button>
    </Toast>
  </div>
);
