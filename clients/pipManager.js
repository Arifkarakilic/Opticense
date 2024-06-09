const { exec, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { TextCache } = require("../src/cache");

class PipManager {
  constructor(options) {
    this.targetPath = options.path;
    this.textcache = new TextCache(path.join(__dirname, "../Licenses"));
  }

  async getDependenciesGraph() {
    return new Promise((resolve, reject) => {
      resolve();
    }).catch();
  }

  setLicensesToDependencies() {
    const licenseInfo = {};
    const that = this;

    return new Promise((resolve, reject) => {
      const fetchLicense = () => {
        const pipModulesPath = path.join(
          this.targetPath,
          "venv",
          "Lib",
          "site-packages"
        );

        if (!fs.existsSync(pipModulesPath)) {
          console.log(`"${pipModulesPath}" Folder not found.`);
          return;
        }

        const searchForLicense = async (folderPath) => {
          const licenseFiles = ["LICENSE", "LICENSE.txt", "LICENSE.md"];
          let licenseFound = false;
          let pckName = folderPath.split(path.sep).pop();

          for (const file of licenseFiles) {
            const filePath = path.join(folderPath, file);
            if (fs.existsSync(filePath)) {
              const license = await that.textcache.compareText(
                pckName,
                filePath
              );
              console.log({ name: pckName, license });
              licenseFound = true;
              break;
            }
          }

          return licenseFound;
        };

        const getLicenseFromPipShow = (dependency) => {
          try {
            const result = execSync(`pip show ${dependency}`).toString();
            const licenseLine = result
              .split("\n")
              .find((line) => line.startsWith("License: "));
            if (licenseLine) {
              const license = licenseLine.split("License: ")[1].trim();
              if (license) {
                console.log({
                  name: dependency,
                  license: { [license + ".txt"]: { similarity: 1 } },
                });
              } else {
                console.log(
                  `License not found for this dependency: ${dependency}!`
                );
              }
            } else {
              console.log(
                `License not found for this dependency: ${dependency}!`
              );
            }
          } catch (error) {
            console.log(
              `License not found for this dependency: ${dependency}!`
            );
          }
        };

        fs.readdir(pipModulesPath, (err, folders) => {
          if (err) {
            console.error(`Error: ${err.message}`);
            return;
          }

          folders.forEach((folder) => {
            const folderPath = path.join(pipModulesPath, folder);

            if (fs.lstatSync(folderPath).isDirectory()) {
              (async () => {
                let licenseFound = await searchForLicense(folderPath);

                if (!licenseFound) {
                  fs.readdir(folderPath, async (err, subFolders) => {
                    if (err) {
                      console.error(`Error: ${err.message}`);
                      return;
                    }

                    let foundInSubFolder = false;
                    for (const subFolder of subFolders) {
                      const subFolderPath = path.join(folderPath, subFolder);
                      if (fs.lstatSync(subFolderPath).isDirectory()) {
                        if (await searchForLicense(subFolderPath)) {
                          foundInSubFolder = true;
                          break;
                        }
                      }
                    }

                    if (!foundInSubFolder) {
                      getLicenseFromPipShow(folder);
                    }
                  });
                }
              })();
            }
          });
        });
      };
      fetchLicense();
      console.log(licenseInfo);
    });
  }
}

module.exports = {
  PipManager,
};
