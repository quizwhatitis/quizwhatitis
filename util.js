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

const randomSubsetFromList = (seed, n, list) => {
  return [...list]
    .sort(
      (x, y) =>
        intFromSeed(JSON.stringify(seed + x)) -
        intFromSeed(JSON.stringify(seed + y))
    )
    .slice(0, n);
};

module.exports = {
  intFromSeed,
  randomFromList,
  randomSubsetFromList
};
