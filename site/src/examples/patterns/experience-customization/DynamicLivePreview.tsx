import { type ChangeEvent, useState } from "react";
import { DataFormatContent } from "./DataFormatContent";
import { initialFormData } from "./StandardControls";
import type { ECFormData } from "./types";

export const DynamicLivePreview = () => {
  const [formData, setFormData] = useState<ECFormData>({ ...initialFormData });

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleRadioChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ maxWidth: 752 }}>
      <DataFormatContent
        formData={formData}
        handleRadioChange={handleRadioChange}
        handleCheckboxChange={handleCheckboxChange}
        stepFieldValidation={{}}
      />
    </div>
  );
};
