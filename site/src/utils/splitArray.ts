const splitArray = <T>(array: T[], chunkSize?: number) => {
  const actualChunkSize = chunkSize || Math.ceil(array.length / 2);

  const chunks: T[][] = [];

  for (let i = 0; i < array.length; i += actualChunkSize) {
    chunks.push(array.slice(i, i + actualChunkSize));
  }

  return chunks;
};

export default splitArray;
