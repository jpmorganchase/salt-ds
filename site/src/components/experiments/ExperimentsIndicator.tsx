import { Tooltip } from "@salt-ds/core";
import { FlagIcon } from "@salt-ds/icons";
import { experiments, useExperiments } from "../../experiments";
import { useIsMobileView } from "../../utils/useIsMobileView";
import { CTALink } from "../cta-link/CTALink";

export const EXPERIMENTS_PAGE = "/salt/themes/experiments";

/** Shows that experiments are on, and links to where they can be turned off. */
export function ExperimentsIndicator() {
  const { enabled } = useExperiments();
  const isMobileOrTablet = useIsMobileView();

  if (enabled.length === 0) return null;

  const names = experiments
    .filter((experiment) => enabled.includes(experiment.id))
    .map((experiment) => experiment.name)
    .join(", ");

  return (
    <Tooltip
      aria-hidden="true"
      content={`Experiments on: ${names}`}
      placement="bottom"
    >
      <CTALink
        href={EXPERIMENTS_PAGE}
        aria-label={`Experiments on: ${names}`}
        sentiment="accented"
      >
        <FlagIcon aria-hidden />
        {/* Icon only on small screens, so the header still fits */}
        {!isMobileOrTablet && "Experiments on"}
      </CTALink>
    </Tooltip>
  );
}
