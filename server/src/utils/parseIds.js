function parseIds(rawIds) {
  if (!Array.isArray(rawIds) || rawIds.length === 0) return null;

  const ids = rawIds.map((id) => parseInt(id, 10)).filter((id) => Number.isInteger(id));
  return ids.length === rawIds.length ? ids : null;
}

module.exports = { parseIds };
