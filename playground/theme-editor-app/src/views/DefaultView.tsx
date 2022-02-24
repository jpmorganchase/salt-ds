import { Button } from "@brandname/core";
import { handleThemeUpload, JSONByScope } from "@brandname/theme-editor";
import "./DefaultView.css";

type DefaultViewProps = {
  onFileUpload: (jsonByScope: JSONByScope[], themeName: string) => void;
  onUseToolkitTheme: () => void;
};

export const DefaultView = (props: DefaultViewProps): React.ReactElement => {
  const useUITKTheme = () => {
    props.onUseToolkitTheme();
  };

  return (
    <div className="themeEditorFileHandler">
      <span>
        You don’t have any theme available here, please get started by using
        UITK theme or uploading a theme from your local drive.
      </span>
      <div className="themeEditorButtons">
        <Button
          variant="cta"
          onClick={(e) => handleThemeUpload(props.onFileUpload)}
        >
          UPLOAD A THEME
        </Button>

        <Button variant="primary" onClick={useUITKTheme}>
          USE UITK THEME
        </Button>

        <Button variant="secondary" disabled>
          LEARN MORE
        </Button>
      </div>
    </div>
  );
};
