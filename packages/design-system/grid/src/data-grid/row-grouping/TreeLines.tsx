import { makePrefixer } from "@jpmorganchase/uitk-core";
import "./TreeLines.css";

const withBaseName = makePrefixer("uitkDataGridTreeLines");

interface TreeLinesProps {
  lines: string[];
}

const TreeLinePipe = function TreeLinePipe() {
  return (
    <div className={withBaseName("treeLine")}>
      <div className={withBaseName("pipe")} />
    </div>
  );
};

const TreeLineL = function TreeLineL() {
  return (
    <div className={withBaseName("treeLine")}>
      <div className={withBaseName("l")} />
    </div>
  );
};

const TreeLineT = function TreeLineT() {
  return (
    <div className={withBaseName("treeLine")}>
      <div className={withBaseName("pipe")} />
      <div className={withBaseName("dash")} />
    </div>
  );
};

export const TreeLines = function TreeLines(props: TreeLinesProps) {
  const { lines } = props;
  return (
    <>
      {lines.map((x, i) => {
        switch (x) {
          case "L":
            return <TreeLineL key={i} />;
          case "I":
            return <TreeLinePipe key={i} />;
          case "T":
            return <TreeLineT key={i} />;
          case " ":
            return <div key={i} className={withBaseName("treeLine")} />;
        }
      })}
    </>
  );
};
