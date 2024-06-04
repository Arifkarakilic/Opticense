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
const { NodeManager, NugetManager, CargoManager } = require("../clients");

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
      "*/.csproj": "nuget",
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
      nuget: NugetManager,
      cargo: CargoManager,
    };

    // Her bir dosya için kontrol yap

    const dirPath = argv.file; // Belirtilen dizin yolu
    fs.readdir(dirPath, async (err, files) => {
      if (err) {
        console.error(`ERROR: Unable to read directory: ${dirPath}`);
        return;
      }
      let manager, file;
      files.forEach((fileName) => {
        if (!manager) {
          file = fileName;
          if (fileName.endsWith(".csproj")) {
            manager = "nuget";
            return;
          }
          manager = configToPackageManager[fileName];
        }
      });
      if (manager) {
        if (!managerClients[manager]) {
          console.log("Not Implemented Yet!");
          return;
        }

        let packageManager = new managerClients[manager]({
          path: argv.file,
          file,
        });

        // graph oluşturma
        await packageManager.getDependenciesGraph();

        packageManager.setLicensesToDependencies();

        // Burada ilgili paket yöneticisi ile işlem yapabilirsiniz
      } else {
        console.log(`ERROR: unsupported language: '${manager}'`);
        return;
      }
    });
  });
};

module.exports = {
  crawl,
};
