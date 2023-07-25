import { useComponentCssInjection } from '@salt-ds/styles';
import { useWindow } from '@salt-ds/window';
import { useAgGridThemeSwitcher } from "../dependencies/ThemeSwitcher";
import { useAgGridHelpers } from "../dependencies/useAgGridHelpers";
import saltStyles from '../../css/_export-salt-icons.module.scss';
import uitkStyles from '../../css/_export-uitk-icons.module.scss';

import iconCss from  "./Icons.css";

const Icons = () => {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-ag-grid-icons",
      css: iconCss,
      window: targetWindow,
    });
    const { switcher, themeName } = useAgGridThemeSwitcher();
    
  const { containerProps, agGridProps } = useAgGridHelpers(
    `ag-theme-${themeName}`
  );
  
    return (
        <>
            {switcher}
            {Object.keys(themeName === "salt" ? saltStyles : uitkStyles).map((key) => {
                const value = themeName === "salt" ? saltStyles[key] : uitkStyles[key];
                console.log(themeName, value)
                if(value.startsWith("\"")) {
                    return (
                        <div 
                            {...containerProps}
                            style={{"--icon-content": value}}
                        >
                            {key}
                        </div>
                    );
                }
            })}
      </>
    );
  };
  
  export default Icons;
  