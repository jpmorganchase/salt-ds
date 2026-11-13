import { AriaAnnouncerProvider } from "@salt-ds/core";
import { MandatoryConfigurationsContent } from "./MandatoryConfigurationsContent";

export const MandatoryConfigurations = () => {
  return (
    <AriaAnnouncerProvider>
      <MandatoryConfigurationsContent />
    </AriaAnnouncerProvider>
  );
};
