export const getPrettyTime = (timestamp: number) =>
  new Date(timestamp * 1000).toISOString().slice(14, 19);
