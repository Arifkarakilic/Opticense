const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const { crawl } = require("./commands");

yargs(hideBin(process.argv))
  .scriptName("file-reader")
  .usage("$0 <cmd> [args]")
  .command(
    "crawl [file]",
    "Read a file",
    (yargs) => {
      return yargs.positional("file", {
        type: "string",
        describe: "The file path to read",
        demandOption: true,
      });
    },
    crawl
  )
  .help()
  .alias("help", "h").argv;
