import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import weekOfYear from "dayjs/plugin/weekOfYear";
import localeData from "dayjs/plugin/localeData";
import updateLocale from "dayjs/plugin/updateLocale";
import localizedFormat from "dayjs/plugin/localizedFormat";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(weekday);
dayjs.extend(weekOfYear);
dayjs.extend(localeData);
dayjs.extend(updateLocale);
dayjs.extend(localizedFormat);
dayjs.extend(isBetween);

export default dayjs;
