const fs = require("fs");
const path = require("path");

class TextCache {
  constructor(directory) {
    this.cache = {};
    this.loadTexts(directory);
  }

  loadTexts(directory) {
    //boyutta sınırlandırma
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

  compareText(packageName, newTextPath, threshold = 0.8) {
    // Threshold 0 ile 1 arasında bir değerdir

    // Yeni metni oku
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
        //console.log(packageName, "license is:", matches);
        resolve(matches);
      });
    });
  }
}
//levenshteinle kıyasladım levenshtein çok daha hassas olmasına rağmen performans düşürücü bir hassasiyette çünkü yazım yanlışı ve noktalamalarda kullanılıyor.
//
function jaccardSimilarity(a, b) {
  const aSet = new Set(a.split(/\s+/));
  const bSet = new Set(b.split(/\s+/));
  const intersection = new Set([...aSet].filter((x) => bSet.has(x)));
  const union = new Set([...aSet, ...bSet]);
  return intersection.size / union.size;
}

// Kullanım Örneği
//const directory = "../Licenses"; // Klasör yolunu belirtin
//const textCache = new TextCache(directory);
// setTimeout(() => {
//     const newTextPath =
//       "C:\\Users\\arifk\\Desktop\\licance compliance tool\\node_modules\\ansi-regex\\license"; // Karşılaştırılacak yeni metin dosya yolunu belirtin
//     textCache.compareText(newTextPath);
//   }, 1000);

// Karşılaştırma yapmak için biraz beklemek gerekebilir, çünkü dosyalar asenkron olarak yükleniyor
module.exports = {
  TextCache,
};
