import { useEffect, useState } from "react";

export default function useDynamicImportCSSDocgen(name) {
  const [props, setProps] = useState(null);

  useEffect(() => {
    let resolved = false;

    import(`@css-docgen/${name}.json`)
      .then((props) => {
        if (!resolved) {
          resolved = true;
          setProps(props.default);
        }
      })
      .catch(console.error);

    return () => {
      resolved = true;
    };
  }, [name]);

  return props;
}
