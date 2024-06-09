function jaccardSimilarity(a, b) {
    const aSet = new Set(a.split(/\s+/));
    const bSet = new Set(b.split(/\s+/));
    const intersection = new Set([...aSet].filter((x) => bSet.has(x)));
    const union = new Set([...aSet, ...bSet]);
    return intersection.size / union.size;
  }
  module.exports = {
    jaccardSimilarity,
  };