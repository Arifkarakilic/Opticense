const fs = require("fs");
const path = require("path");
const { jaccardSimilarity } = require("./compare");

class TextCache {
  constructor(directory) {
    this.cache = {};
    this.loadTexts(directory);
  }

  loadTexts(directory) {
    fs.readdir(directory, (err, files) => {
      if (err) {
        console.error("Error reading directory:", err);
        return;
      }

      files.forEach((file) => {
        if (file.endsWith(".txt")) {
          const filePath = path.join(directory, file);
          fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
              console.error("Error reading file:", err);
              return;
            }
            this.cache[file] = data;
          });
        }
      });
    });
  }

  compareText(packageName, newTextPath, threshold = 0.85) {
    return new Promise((resolve, reject) => {
      fs.readFile(newTextPath, "utf8", (err, newText) => {
        if (err) {
          console.error("Error reading new text file:", err);
          return resolve(null);
        }

        const matches = {};
        for (const [fileName, text] of Object.entries(this.cache)) {
          const similarityScore = jaccardSimilarity(newText, text);
          if (similarityScore >= threshold) {
            matches[fileName] = {
              //text: text,
              similarity: similarityScore,
            };
          }
        }
        if (Object.values(matches).length == 0) {
          console.log("No licenses matching existing licenses were found!");
          return resolve(null);
        }
        resolve(matches);
      });
    });
  }
}


module.exports = {
  TextCache,
};
