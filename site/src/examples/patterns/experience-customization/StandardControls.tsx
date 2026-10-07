import { type ChangeEvent, useState } from "react";
import { RegionalSettingsContent } from "./RegionalSettingsContent";
import type { ECFormData } from "./types";

export const initialFormData: ECFormData = {
  // Foundation
  displayDensity: "",
  acceptTerms: false,
  // Regional
  region: "",
  publicHolidayCalendar: "",
  firstDayOfWeek: "sunday",
  timeFormat: "12-hour",
  measurementSystem: "metric",
  // Data format
  stockNameDisplay: "fullNameTicker",
  exchangeAndRegionDisplay: "both",
  visibleMetrics: "lastPrice",
  performanceChart: true,
  // Notifications
  position: "top-right",
  autoDismiss: false,
  extendDisplayTime: false,
};

export const StandardControls = () => {
  const [formData, setFormData] = useState<ECFormData>({ ...initialFormData });

  const handleRadioChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <RegionalSettingsContent
        formData={formData}
        handleRadioChange={handleRadioChange}
        handleSelectChange={handleSelectChange}
        stepFieldValidation={{}}
      />
    </div>
  );
};
