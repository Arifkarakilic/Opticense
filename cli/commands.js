//  folder control                                    +
//  project                                           +
//      json, req.txt, maven, etc.                    +
//          which packages manager?                   +
//          exmp node modules, etc..                  +
//              dependency tree control
//              communucite to pm than gets licenses
//                      compare and compliance
//                          report

const fs = require("fs");
const path = require("path");
const { NodeManager } = require("./packagesManagers");

const crawl = (argv) => {
  fs.access(argv.file, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`${argv.file} folder not found.`);
      return;
    }

    console.log("Folder found, checking for configuration files...");

    // Paket yöneticisi ve konfigürasyon dosyaları eşleşmesi
    const configToPackageManager = {
      "package.json": "node",
      "requirements.txt": "pip",
      "pom.xml": "maven",
      Gemfile: "bundler",
      "composer.json": "composer",
      "go.mod": "go",
      "Cargo.toml": "cargo",
      ".csproj": "nuget",
      "build.gradle": "gradle",
      "pubspec.yaml": "pub",
      Podfile: "cocoapods",
      Cartfile: "carthage",
      ".npmrc": "node",
      "bower.json": "bower",
      "CMakeLists.txt": "cmake",
      "stack.yaml": "stack",
      "project.clj": "lein",
      "mix.exs": "mix",
      "shard.yml": "shards",
      "Cargo.lock": "cargo",
      "yarn.lock": "node",
      Pipfile: "pipenv",
      "Pipfile.lock": "pipenv",
    };
    const managerToDependencyDir = {
      node: "node_modules/",
      pip: "lib/pythonX.X/site-packages/", // X.X should be replaced with the actual Python version
      maven: ".m2/repository/",
      gradle: "build/libs/",
      bundler: "vendor/bundle",
      composer: "vendor/",
      go: "pkg/mod/",
      cargo: "target/debug/deps/", // or target/release/deps/ depending on the build type
      nuget: "packages/",
    };

    const managerClients = {
      node: NodeManager,
    };

    // Her bir dosya için kontrol yap
    Object.entries(configToPackageManager).forEach(([file, manager]) => {
      const filePath = path.join(argv.file, file);
      fs.access(filePath, fs.constants.F_OK, async (err) => {
        if (!err) {
          let packageManager = new managerClients[manager](argv.file);
          if (!packageManager) {
            console.log(`ERROR: unsupported language: '${manager}'`);
            return;
          }

          // graph oluşturma
          await packageManager.getDependenciesGraph();

          packageManager.setLicensesToDependencies();

          // Burada ilgili paket yöneticisi ile işlem yapabilirsiniz
        }
      });
    });
  });
};

module.exports = {
  crawl,
};
