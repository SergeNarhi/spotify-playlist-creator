function chunkArray(sourceArray, chunkMaxLength) {
  var chunks = [];
  var i = 0;
  var n = sourceArray.length;

  while (i < n) {
    chunks.push(sourceArray.slice(i, i += chunkMaxLength));
  }
  return chunks;
}

module.exports = {
  chunkArray: chunkArray,
};
