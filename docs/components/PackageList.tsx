import "./PackageList.css";

const classBase = "saltPackageList";

export const PackageList = ({ packages }: { packages: string[] }) => {
  return (
    <div className={classBase}>
      {packages.map((packageName) => (
        <span className={`${classBase}-package`} key={packageName}>
          {packageName}
        </span>
      ))}
    </div>
  );
};
