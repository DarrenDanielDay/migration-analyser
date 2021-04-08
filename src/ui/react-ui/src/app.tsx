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
      setVersions(versions.sort(versionCompare));
    });
  }, [selectedPackage]);
  return (
    <>
      {loaded && (
        <div style={{ display: "flex", flexDirection: "row" }}>
          {
            <PackageDisplay
              packages={packages}
              onSelect={(pkg) => setSelectedPackage(pkg)}
            ></PackageDisplay>
          }
          {loaded && selectedPackage && versions.length && (
            <VersionRangeInput
              initVersion={versions[0]!}
              versions={versions}
              onConfirm={(range) => {
                selectedPackage &&
                  window.extensionAPI.diff({
                    from: range[0],
                    to: range[1],
                    packageName: selectedPackage,
                  }).then(result => {
                    const useful =  result.filter(item => !!item.references.length);
                    console.log(useful);
                    
                  }).catch(e => {
                    console.log(e)
                  });
              }}
            ></VersionRangeInput>
          )}
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
        <div
          className="package-display"
          key={i}
          onClick={() => onSelect?.(pkg)}
        >
          {pkg}
        </div>
      ))}
    </div>
  );
};

function stringCmp(a?: string, b?: string) {
  return !a || !b
    ? a === undefined
      ? -1
      : b === undefined
      ? 1
      : 0
    : a > b
    ? 1
    : a < b
    ? -1
    : 0;
}

function versionString(version: IVersion) {
  return `${version.major}.${version.minor}.${version.patch}${
    version.preview ? `-${version.preview}` : ""
  }`;
}
const versionCompare = (a: IVersion, b: IVersion): number => {
  return -(a.major !== b.major
    ? a.major - b.major
    : a.minor !== b.minor
    ? a.minor - b.minor
    : a.patch !== b.patch
    ? a.patch - b.patch
    : stringCmp(a.preview, b.preview));
};

interface IVersionInputProp {
  versions: IVersion[];
  initVersion: IVersion;
  onChange: (version: IVersion) => any;
}

const VersionInput: React.FC<IVersionInputProp> = ({
  initVersion,
  versions,
  onChange,
}) => {
  const [version, setVersion] = useState(initVersion);
  useEffect(() => {
    setVersion(initVersion);
  }, [initVersion]);
  return (
    <div>
      <select
        onChange={(e) => {
          const version = versions.find(
            (v) => versionString(v) === e.target.value
          )!;
          setVersion(version);
          onChange(version);
        }}
        value={versionString(version)}
      >
        {versions.map((version, i) => (
          <option key={i}>{versionString(version)}</option>
        ))}
      </select>
    </div>
  );
};
interface IVersionRangeInputProp {
  versions: IVersion[];
  initVersion: IVersion;
  onConfirm: (range: [IVersion, IVersion]) => any;
}
const VersionRangeInput: React.FC<IVersionRangeInputProp> = ({
  initVersion,
  onConfirm,
  versions,
}) => {
  const [fromVersion, setFromVersion] = useState<IVersion>(initVersion);
  const [toVersion, setToVersion] = useState<IVersion>(initVersion);
  const [allowedVersion, setAllowedVersion] = useState(versions);
  useEffect(() => {
    setFromVersion(initVersion);
    setToVersion(initVersion);
  }, [initVersion]);
  useEffect(() => {
    const end = versions.indexOf(fromVersion) + 1;
    if (!end) return;
    setAllowedVersion(versions.slice(0, end));
  }, [versions, fromVersion]);
  return (
    <div>
      <label>From</label>
      <VersionInput
        versions={versions}
        initVersion={initVersion}
        onChange={setFromVersion}
      ></VersionInput>
      <label>To</label>
      <VersionInput
        versions={allowedVersion}
        initVersion={allowedVersion[allowedVersion.length - 1]!}
        onChange={setToVersion}
      ></VersionInput>
      <button
        onClick={() => {
          onConfirm([fromVersion, toVersion]);
        }}
      >
        See Changes
      </button>
    </div>
  );
};
