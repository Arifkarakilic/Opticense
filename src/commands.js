const fs = require("fs");
const path = require("path");
const {
  NodeManager,
  NugetManager,
  CargoManager,
  PipManager,
} = require("../clients");

const crawl = (argv) => {
  fs.access(argv.file, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`${argv.file} folder not found.`);
      return;
    }

    console.log("Folder found, checking for configuration files...");

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
      pip: "lib/pythonX.X/site-packages/",
      maven: ".m2/repository/",
      gradle: "build/libs/",
      bundler: "vendor/bundle",
      composer: "vendor/",
      go: "pkg/mod/",
      cargo: "target/debug/deps/",
      nuget: "packages/",
    };

    const managerClients = {
      node: NodeManager,
      nuget: NugetManager,
      cargo: CargoManager,
      pip: PipManager,
    };

    const dirPath = argv.file;
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

        await packageManager.getDependenciesGraph();

        packageManager.setLicensesToDependencies();
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
