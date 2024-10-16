import { Sidebar } from "@jpmorganchase/mosaic-site-components";
import {
  type SiteState,
  useMeta,
  useRoute,
  useStore,
} from "@jpmorganchase/mosaic-store";
import {
  TabBar,
  TabListNext,
  TabNext,
  TabNextPanel,
  TabNextTrigger,
  TabsNext,
} from "@salt-ds/lab";
import { useRouter } from "next/navigation";
import {
  type FC,
  type SyntheticEvent,
  useEffect,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import { a, code, p, ul } from "../../components/mdx";
import { TableOfContents } from "../../components/toc";
import useIsMobileView from "../../utils/useIsMobileView";
import { DetailBase } from "../DetailBase";
import type { LayoutProps } from "../types";
import styles from "./DetailComponent.module.css";
import MobileDrawer from "./MobileDrawer";
import SecondarySidebar from "./SecondarySidebar";
import TitleWithDrawer from "./TitleWithDrawer";

const components = { code, ul, p, a } as any;

const tabs = [
  { name: "examples", label: "Examples" },
  { name: "usage", label: "How to use" },
  { name: "accessibility", label: "Accessibility" },
];

export type Relationship = "similarTo" | "contains";

interface RelatedComponent {
  name: string;
  relationship: Relationship;
}

interface ComponentNpmInfo {
  name: string;
  initialVersion?: string;
}

export interface Data {
  description: string;
  alsoKnownAs: string[];
  relatedComponents: RelatedComponent[];
  relatedPatterns: string[];
  sourceCodeUrl: string;
  package: ComponentNpmInfo;
  bugReport?: string;
  featureRequest?: string;
}

type CustomSiteState = SiteState & { data?: Data };

export const DetailComponent: FC<LayoutProps> = ({ children }) => {
  const [openDrawer, setOpenDrawer] = useState(false);

  const { replace, push } = useRouter();
  const { route } = useRoute();

  const newRoute = route?.substring(0, route.lastIndexOf("/") + 1);

  const useData = useStore((state: CustomSiteState) => {
    const defaultData: Partial<Data> = {
      bugReport:
        "https://github.com/jpmorganchase/salt-ds/issues/new?assignees=&labels=type%3A+bug+%F0%9F%AA%B2%2Cstatus%3A+awaiting+triage&template=bug_report.yml",
      featureRequest:
        "https://github.com/jpmorganchase/salt-ds/issues/new?assignees=&labels=type%3A+enhancement+%F0%9F%92%A1%2Cstatus%3A+awaiting+triage&template=feature_request.yml",
    };

    return state.data ? { ...defaultData, ...state.data } : undefined;
  });

  const { description } = useData ?? {};

  const currentTab = tabs.find(({ name }) => route?.includes(name));

  useEffect(() => {
    // Default to first tab, "Examples"
    if (!currentTab) {
      replace(`${newRoute}${tabs[0].name}`);
    }
  }, [currentTab, newRoute, replace]);

  const isMobileView = useIsMobileView();

  const handleTabChange = (_: SyntheticEvent | null, value: string) => {
    push(`${newRoute}${value}`);
  };

  const {
    meta: { title },
  } = useMeta();

  return (
    <DetailBase
      sidebar={
        !isMobileView ? (
          <Sidebar sticky>
            {
              <SecondarySidebar
                additionalData={useData}
                tableOfContents={<TableOfContents />}
              />
            }
          </Sidebar>
        ) : undefined
      }
      pageTitle={
        isMobileView ? (
          <TitleWithDrawer
            title={title}
            openDrawer={openDrawer}
            setOpenDrawer={setOpenDrawer}
          />
        ) : undefined
      }
      isMobileView={isMobileView}
    >
      {isMobileView && (
        <MobileDrawer
          open={openDrawer}
          drawerContent={<SecondarySidebar additionalData={useData} />}
        />
      )}
      <ReactMarkdown components={components}>{description ?? ""}</ReactMarkdown>
      <TabsNext
        value={currentTab?.name ?? tabs[0].name}
        onChange={handleTabChange}
      >
        <TabBar className={styles.tabBar} separator>
          <TabListNext appearance="transparent">
            {tabs.map(({ name, label }) => (
              <TabNext key={name} value={name}>
                <TabNextTrigger>{label}</TabNextTrigger>
              </TabNext>
            ))}
          </TabListNext>
        </TabBar>
        {tabs.map(({ name }) => (
          <TabNextPanel key={name} value={name}>
            {children}
          </TabNextPanel>
        ))}
      </TabsNext>
    </DetailBase>
  );
};
