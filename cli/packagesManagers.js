const { rejects } = require("assert");
const { exec, execSync } = require("child_process");

class NodeManager {
  configFile = "package.json";
  packagesFolder = "node_modules";
  isLocalInstalled = true;
  dependecyGraph = {};

  constructor(targetPath) {
    this.targetPath = targetPath;
  }

  async getDependenciesGraph() {
    return new Promise((resolve, reject) => {
      {
        //read p.json
        //  get dep name depth=9999
        console.log("Dependency graph creating...");
        exec(
          `npm list --depth=9999 --json`,
          { cwd: this.targetPath },
          (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              return reject();
            }
            this.dependecyGraph = JSON.parse(stdout).dependencies;
            console.log("Dependency graph created.");
            //console.log(this.dependecyGraph);
            resolve();
          }
        );
      }
    });
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

      const fetchLicense = (name) => {
        // TODO: node_moules içinde paket aranacak, içerisinden license getirilecek ve graph'a eklenecek
        //olabildiğince recursivelerden kaçınılacağız ki proje amacına varsın
      };

      for (let [pName, pInfo] of Object.entries(that.dependecyGraph)) {
        fetchLicense(pName, pInfo);
      }
      console.log(licenseInfo);
    });
  }
}

module.exports = {
  NodeManager,
};
