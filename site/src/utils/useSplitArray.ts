const useSplitArray = <T>(array: T[]) => {
  const arrayHalf = Math.ceil(array.length / 2);

  const firstHalf = array.slice(0, arrayHalf);
  const secondHalf = array.slice(arrayHalf);

  return [firstHalf, secondHalf];
};

export default useSplitArray;
