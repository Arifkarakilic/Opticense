

const { rejects } = require("assert");
const { exec, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { TextCache } = require("../cli/cache");
const xml2js = require("xml2js");
const { array } = require("yargs");
const { log } = require("console");

class NugetManager {
  configFile = "package.json";
  packagesFolder = "node_modules";
  isLocalInstalled = true;
  dependecyGraph = {};

  constructor(options) {
    this.targetPath = options.path;
    this.file = options.file;
    this.textcache = new TextCache(path.join(__dirname, "../Licenses"));
  }

  async getDependenciesGraph() {
    return new Promise((resolve, reject) => {
      {
        resolve();
      }
    }).catch();
  }

  setLicensesToDependencies() {
    this.extractPackageReferences();
  }

  extractPackageReferences() {
    console.log(this.file);
    fs.readFile(path.join(this.targetPath, this.file), (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }

      xml2js.parseString(data, (err, result) => {
        if (err) {
          console.error("Error parsing XML:", err);
          return;
        }

        const packageReferences = [];
        const itemGroups = result.Project.ItemGroup;

        if (itemGroups) {
          itemGroups.forEach((group) => {
            if (group.PackageReference) {
              group.PackageReference.forEach((reference) => {
                const include = reference.$.Include;
                let version = reference.$.Version;
                if (Array.isArray(reference.Version)) {
                  version = reference.Version[0];
                }
                packageReferences.push({ include, version });
              });
            }
          });
        }

        //console.log(packageReferences);
        this.findNugetPackages(packageReferences);
      });
    });
  }
  findNugetPackages(packageReferences) {
    const nugetPath = path.join(process.env.USERPROFILE, ".nuget", "packages");

    packageReferences.forEach((pkg) => {
      const readPackageContents = (packagePath) => {
        fs.readdir(packagePath, async (err, files) => {
          if (err) {
            console.error("Error reading package contents:", err);
            return;
          }

          const licenseFiles = [
            "LICENSE",
            "LICENSE.txt",
            "licenses",
            "license.txt",
            "LICENSE.TXT",
            "license.TXT",
          ];
          const foundLicenseFiles = files.filter((file) =>
            licenseFiles.includes(file)
          );

          foundLicenseFiles.forEach((file) => {
            const filePath = path.join(packagePath, file);
            fs.readFile(filePath, "utf8", async (err, data) => {
              if (err) {
                console.error("Error reading file:", err);
                return;
              }

              let license = {name:pkg.include, ...(await this.textcache.compareText(
                pkg.include,
                filePath
              ))};
              console.log(license);
            });
          });

          if (foundLicenseFiles.length === 0) {
            let data = await this.readNuspecFile(
              packagePath,
              files,
              pkg.include
            );
            if (!data) {
              console.log(
                "No registered license type was found or a license was not found in this package."
              );
              return;
            }
            log({
               name: pkg.include , [data]: { similarity: 1 },
              note: "This license type came from the nuspec file.",
            });
          }
        });
      };

      const packagePath = path.join(
        nugetPath,
        pkg.include.toLowerCase(),
        pkg.version
      );
      fs.access(packagePath, fs.constants.F_OK, (err) => {
        if (err) {
          fs.readdir(
            path.join(nugetPath, pkg.include.toLowerCase()),
            async (err, files) => {
              if (files.length == 0 || err) {
                console.error(
                  `Package not found: ${pkg.include} ${pkg.version}`
                );
                return;
              }
              files = files.sort();
              readPackageContents(
                path.join(
                  nugetPath,
                  pkg.include.toLowerCase(),
                  files[files.length - 1]
                )
              );

            }
          );
          return;
        }
        readPackageContents(packagePath);
      });
    });
  }
  readNuspecFile(packagePath, files, packageName) {
    return new Promise((resolve, reject) => {
      const nuspecFile = files.find((file) => file.endsWith(".nuspec"));
      if (!nuspecFile) {
        console.error("No .nuspec file found");
        return;
      }

      const nuspecFilePath = path.join(packagePath, nuspecFile);
      fs.readFile(nuspecFilePath, "utf8", (err, data) => {
        if (err) {
          console.error("Error reading .nuspec file:", err);
          return;
        }

        xml2js.parseString(data, (err, result) => {
          if (err) {
            console.error("Error parsing .nuspec XML:", err);
            return;
          }

          const licenseElement = result.package.metadata[0].license;
          if (!licenseElement) {
            console.error("No <license> element found in .nuspec file");
            return;
          }

          const licenseFileName = licenseElement[0]._;
          resolve(licenseFileName);
        });
      });
    });
  }
}

module.exports = {
  NugetManager,
};
