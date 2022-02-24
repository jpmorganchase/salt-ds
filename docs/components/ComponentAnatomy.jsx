import React, { useCallback, useEffect, useRef, useState } from "react";
import "./ComponentAnatomy.css";

const registerMutationObserver = (element, callback) => {
  console.log("registerMutationObserver");

  var config = { attributes: true, childList: true, subtree: true };

  const handler = (mutations) => {
    for (let mutation of mutations) {
      const { type, attributeName, target } = mutation;
      if (type === "attributes" && attributeName === "aria-controls") {
        const ariaControls = target.getAttribute("aria-controls");
        const relatedElement = document.getElementById(ariaControls);
        if (relatedElement) {
          // Mutation observer references are weak refs, so will be collected
          observer.observe(relatedElement, config);
        }
      }
    }
    callback(mutations);
  };

  const observer = new MutationObserver(handler);
  observer.observe(element, config);
};

export const ComponentAnatomy = ({
  children = null,
  "aria-owns": targetId,
  showControls = true,
  ...props
}) => {
  const root = useRef(null);
  const [tree, setTree] = useState([]);
  const [[showClasses, showRole, showAria, showData], setState] = useState([
    1, 1, 1, 1,
  ]);

  const toggleClasses = () =>
    setState([!showClasses, showRole, showAria, showData]);
  const toggleRole = () =>
    setState([showClasses, !showRole, showAria, showData]);
  const toggleAria = () =>
    setState([showClasses, showRole, !showAria, showData]);
  const toggleData = () =>
    setState([showClasses, showRole, showAria, !showData]);

  // One child policy, strictly enforced
  targetId || React.Children.only(children);

  const fetchTree = async (target) => {
    const t = await getElementTree(target);
    setTree(t);
  };

  const getComponentElement = () =>
    targetId
      ? document.querySelector(`#${targetId}`)
      : root.current.querySelector(".RenderVisualiser-component > *");

  const mutationHandler = useCallback((mutations) => {
    const target = getComponentElement();
    fetchTree(target);
  }, []);

  useEffect(() => {
    // also somehow need to monitor owned and controlled elements
    const target = getComponentElement();
    if (target) {
      registerMutationObserver(target, mutationHandler);
      fetchTree(target);
    }
  }, [mutationHandler]);

  return (
    <div className="RenderVisualiser" ref={root} {...props}>
      {children ? (
        <div className="RenderVisualiser-component">{children}</div>
      ) : null}
      <div className="RenderVisualiser-view">
        {showControls ? (
          <div className="RenderVisualiser-header">
            <span className="component-name">{children?.type.displayName}</span>
            <div className="actions">
              <label className="checkbox-classes">
                class names
                <input
                  type="checkbox"
                  checked={showClasses}
                  onChange={toggleClasses}
                />
              </label>
              <label className="checkbox-classes">
                aria role
                <input
                  type="checkbox"
                  checked={showRole}
                  onChange={toggleRole}
                />
              </label>
              <label className="checkbox-classes">
                aria attributes
                <input
                  type="checkbox"
                  checked={showAria}
                  onChange={toggleAria}
                />
              </label>
              <label className="checkbox-classes">
                data attributes
                <input
                  type="checkbox"
                  checked={showData}
                  onChange={toggleData}
                />
              </label>
            </div>
          </div>
        ) : null}
        <div className="RenderVisualiser-content">{renderTree(tree)}</div>
      </div>
    </div>
  );

  function getId(id) {
    if (id) {
      return `#${id}`;
    } else {
      return "";
    }
  }

  function renderTree(tree, key = 0) {
    return tree
      ? tree
          // .filter((node) => typeof node !== 'string')
          .map((node, i) => {
            if (typeof node === "string") {
              if (node.length > 0) {
                return (
                  <div className="string-value" key={key}>{`"${node}"`}</div>
                );
              } else {
                return undefined;
              }
            } else {
              const {
                id,
                name,
                children,
                classes,
                ariaAttributes,
                dataAttributes,
                role,
              } = node;
              return (
                <div className="RenderedElement" key={`${key}-${i}`}>
                  <div className="rendered-attributes">
                    <span className="tagName" key="name">
                      {`<${name.toLowerCase()}${getId(id)}`}
                    </span>
                    {showRole && role ? (
                      <span className="rendered-role">{role}</span>
                    ) : undefined}
                    {showClasses &&
                      classes.map((className, j) => (
                        <span
                          className="class-name"
                          key={`class-${j}`}
                        >{`.${className}`}</span>
                      ))}
                    {showAria &&
                      Object.entries(ariaAttributes).map(([name, value], k) => (
                        <Attribute
                          key={`aria-${k}`}
                          name={name.slice(5)}
                          prefix="aria"
                          value={value}
                        />
                      ))}
                    {showData &&
                      Object.entries(dataAttributes).map(([name, value], k) => (
                        <Attribute
                          key={`data-${k}`}
                          name={name.slice(5)}
                          prefix="data"
                          value={value}
                        />
                      ))}
                  </div>
                  {renderTree(children, key + 1)}
                </div>
              );
            }
          })
      : [];
  }
};

function getAttributes(element) {
  let role;
  const ariaAttributes = {};
  const dataAttributes = {};

  const length = element.attributes?.length ?? 0;
  for (let i = 0; i < length; i++) {
    const { name, value } = element.attributes[i];
    if (name === "role") {
      role = value;
    } else if (name.startsWith("aria")) {
      ariaAttributes[name] = value;
    } else if (name.startsWith("data")) {
      dataAttributes[name] = value;
    }
  }
  return [role, ariaAttributes, dataAttributes];
}

const getChildNodesArray = ({ childNodes }) => {
  if (childNodes) {
    const childNodesArray = Array.from(childNodes);
    if (childNodesArray.length > 5) {
      return childNodesArray.slice(0, 5);
    } else if (childNodesArray.length > 0) {
      return childNodesArray;
    }
  }
};

const splitOutRelatedItems = (arrayOfArrays) => {
  const primaryItems = [];
  const relatedItems = [];
  arrayOfArrays.forEach(([firstItem, ...rest]) => {
    primaryItems.push(firstItem);
    if (rest.length) {
      relatedItems.push(...rest);
    }
  });
  return [primaryItems, relatedItems];
};

const resolveElementChildren = async (childNodesArray) => {
  const childs = await Promise.all(childNodesArray.map(getElementTree));
  return splitOutRelatedItems(childs);
};

async function getElementTree(element) {
  const { id, tagName, textContent, classList } = element;
  const classes = classList ? [...classList.values()] : [];
  const [role, ariaAttributes, dataAttributes] = getAttributes(element);

  const childNodesArray = getChildNodesArray(element);

  const [children, relatedElements] = childNodesArray
    ? await resolveElementChildren(childNodesArray)
    : [undefined];

  const result = [];
  if (tagName) {
    result.push({
      id,
      name: tagName,
      classes,
      ariaAttributes,
      dataAttributes,
      children,
      role,
    });

    if (relatedElements && relatedElements.length) {
      result.push(...relatedElements);
    }
  } else {
    result.push(textContent);
  }

  return new Promise(async (resolve, reject) => {
    const { "aria-owns": ownedId, "aria-controls": controlledId } =
      ariaAttributes;
    if (ownedId !== undefined || controlledId !== undefined) {
      const target = document.getElementById(ownedId || controlledId);
      if (target) {
        const t2 = await getElementTree(target);
        resolve(result.concat(t2));
      } else {
        // Often a delay in opening dropdown
        requestAnimationFrame(async () => {
          const target = document.getElementById(ownedId || controlledId);
          if (target) {
            const t2 = await getElementTree(target);
            resolve(result.concat(t2));
          } else {
            resolve(result);
          }
        });
      }
    } else {
      resolve(result);
    }
  });
}

const Attribute = ({ name, prefix = "data", value }) => (
  <span className={`${prefix}-attribute`}>
    <span className="attribute-name">{name}</span>
    {value !== "true" ? (
      <span className="attribute-value">{value}</span>
    ) : undefined}
  </span>
);
