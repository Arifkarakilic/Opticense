// ana dizinde node modulesu bul
// bütün alt klasörlerinde gezin ve şu dosyaları ara:
// licenses, LICENSE, LICENSE.txt
//
//
//

const { rejects } = require("assert");
const { exec, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { TextCache } = require("./cache");

class NodeManager {
  configFile = "package.json";
  packagesFolder = "node_modules";
  isLocalInstalled = true;
  dependecyGraph = {};

  constructor(targetPath) {
    this.targetPath = targetPath;
    this.textcache = new TextCache(path.join(__dirname, "../Licenses"));
  }

  async getDependenciesGraph() {
    return new Promise((resolve, reject) => {
      {
        // İşletim sistemini kontrol edin
        const platform = os.platform();
        let command = "";

        if (platform === "win32") {
          // Windows komutu
          command = "npm list --depth=9999 --json 2>nul";
        } else {
          // Unix tabanlı sistemler için komut
          command = "npm list --depth=9999 --json 2>/dev/null";
        }
        //read p.json
        //  get dep name depth=9999
        console.log("Dependency graph creating...");
        exec(command, { cwd: this.targetPath }, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return reject();
          }
          this.dependecyGraph = JSON.parse(stdout).dependencies;
          console.log("Dependency graph created.");
          //console.log(this.dependecyGraph);
          resolve();
        });
      }
    }).catch();
  }

  setLicensesToDependencies() {
    let licenseInfo = {};
    // Object.keys(this.dependecyGraph).forEach((pkg, index, array) => {
    //   console.log("Fetch licenses...");
    // });
    const that = this;
    return new Promise((resolve, reject) => {
      // const fetchLicense = (pkgName, packageInfo) => {
      //   let licenseStdout = execSync(`npm view ${pkgName} license`);
      //   const license = licenseStdout.toString().trim();
      //   licenseInfo[pkgName] = license;
      //   console.log(`${pkgName}: ${license}`);

      //   for (let pkg of Object.entries(
      //     packageInfo?.dependencies ? packageInfo.dependencies : {}
      //   )) {
      //     fetchLicense(pkg[0], pkg[1]);
      //   }
      // };

      const fetchLicense = () => {
        const nodeModulesPath = path.join(this.targetPath, "node_modules");

        if (!fs.existsSync(nodeModulesPath)) {
          console.log(`"${nodeModulesPath}" Folder not found.`);
          return;
        }

        const searchForLicense = (folderPath) => {
          const licenseFiles = ["LICENSE", "LICENSE.txt", "licenses"];
          let licenseFound = false;
          let pckName = folderPath.split("\\");
          pckName = pckName[pckName.length - 1];
          licenseFiles.forEach((file) => {
            const filePath = path.join(folderPath, file);
            if (fs.existsSync(filePath)) {
              //console.log(`Find: ${filePath}`);
              let license  = this.textcache.compareText(pckName, filePath);
              //console.log("license was found:", folderPath, license)
              licenseFound = true;
            }
          });

          return licenseFound;
        };

        fs.readdir(nodeModulesPath, (err, folders) => {
          if (err) {
            console.error(`Error: ${err.message}`);
            return;
          }

          folders.forEach((folder) => {
            const folderPath = path.join(nodeModulesPath, folder);

            if (fs.lstatSync(folderPath).isDirectory()) {
              let licenseFound = searchForLicense(folderPath);

              if (!licenseFound) {
                fs.readdir(folderPath, (err, subFolders) => {
                  if (err) {
                    console.error(`Error: ${err.message}`);
                    return;
                  }

                  subFolders.forEach((subFolder) => {
                    const subFolderPath = path.join(folderPath, subFolder);
                    if (fs.lstatSync(subFolderPath).isDirectory()) {
                      searchForLicense(subFolderPath);
                    }
                  });
                });
              }
            }
          });
        });
      };

      // for (let [pName, pInfo] of Object.entries(that.dependecyGraph)) {
      //   fetchLicense(pName, pInfo);
      // }
      fetchLicense();
      console.log(licenseInfo);
    });
  }
}

module.exports = {
  NodeManager,
};
