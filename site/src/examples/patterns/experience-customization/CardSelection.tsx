import { type ChangeEvent, useState } from "react";
import { NotificationsContent } from "./NotificationsContent";
import { initialFormData } from "./StandardControls";
import type { ECFormData } from "./types";

export const CardSelection = () => {
  const [formData, setFormData] = useState<ECFormData>({ ...initialFormData });

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <NotificationsContent
      formData={formData}
      handleCheckboxChange={handleCheckboxChange}
      handleSelectChange={handleSelectChange}
      stepFieldValidation={{}}
      style={{ maxWidth: 700 }}
    />
  );
};
