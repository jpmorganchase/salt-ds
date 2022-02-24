import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const useTabsWithRouting = (
  pathnames: string[],
  replace?: boolean
): [number, (tabIndex: number, path?: string) => void] => {
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const navigate = useNavigate();
  const location = useLocation();
  const locationHistory = useRef(location.pathname);

  const handleTabSelection = (tabIndex: number, path?: string) => {
    setSelectedTab(tabIndex);
    const pathname = `${pathnames[tabIndex]}${path ? `/${path}` : ``}`;
    navigate(pathname, { replace: replace });
    locationHistory.current = pathname;
  };

  useEffect(() => {
    if (location.pathname !== locationHistory.current) {
      const pathTab = pathnames.find((path) =>
        location.pathname.includes(path)
      );
      pathTab && setSelectedTab(pathnames.indexOf(pathTab));
      locationHistory.current = location.pathname;
    }
  }, [locationHistory, location, pathnames]);

  return [selectedTab, handleTabSelection];
};
