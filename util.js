const { createHash } = require("crypto");
const intFromSeed = seed => {
  const encoded = JSON.stringify(seed);
  const hash = createHash("md5")
    .update(encoded, "utf8")
    .digest()
    .toString("hex");
  const s = hash.slice(-10);
  return parseInt(s, 16);
};

const randomFromList = (seed, list) => {
  if (list.length === 1) {
    return list[0];
  }
  return list[intFromSeed(seed) % (list.length - 1)];
};

module.exports = {
  intFromSeed,
  randomFromList
};
