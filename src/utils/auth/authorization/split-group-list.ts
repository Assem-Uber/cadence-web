export const splitGroupList = (raw: string) =>
  raw
    .split(/[,\s]+/g)
    .map((g) => g.trim())
    .filter((g) => g.length > 0);
