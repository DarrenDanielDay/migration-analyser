import { IVersion } from "../message-protocol";

export const App: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  const [packages, setPackages] = useState<string[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [versions, setVersions] = useState<IVersion[]>([]);
  useEffect(() => {
    extensionAPI.loadProject(undefined).then((loaded) => {
      setLoaded(loaded);
    });
  }, []);
  useEffect(() => {
    if (!loaded) {
      return;
    }
    extensionAPI.getAllPackages(undefined).then((packageJson) => {
      const packages = [
        ...Object.keys(packageJson.dependencies),
        ...Object.keys(packageJson.devDependencies),
      ].filter((pkg) => !pkg.includes("@types"));
      setPackages(packages);
    });
  }, [loaded]);
  useEffect(() => {
    if (!selectedPackage) {
      return;
    }
    extensionAPI.getAllVersions(selectedPackage).then((versions) => {
      setVersions(versions);
    });
  });
  return (
    <>
      {loaded && (
        <div>
          {
            <PackageDisplay
              packages={packages}
              onSelect={(pkg) => setSelectedPackage(pkg)}
            ></PackageDisplay>
          }
          {<VersionList versions={versions}></VersionList>}
        </div>
      )}
    </>
  );
};

interface IPackageDisplayProp {
  packages: string[];
  onSelect?: (pkg: string) => any;
}

const PackageDisplay: React.FC<IPackageDisplayProp> = ({
  packages,
  onSelect,
}) => {
  return (
    <div>
      {packages.map((pkg, i) => (
        <div key={i} onClick={() => onSelect?.(pkg)}>
          {pkg}
        </div>
      ))}
    </div>
  );
};

interface IVersionListProp {
  versions: IVersion[];
}

const VersionList: React.FC<IVersionListProp> = ({ versions }) => {
  return (
    <div>
      {versions.map((version, i) => (
        <div key={i}>
          {version.major}.{version.minor}.{version.patch}
        </div>
      ))}
    </div>
  );
};
