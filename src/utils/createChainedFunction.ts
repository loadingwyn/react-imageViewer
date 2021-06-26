export default function createChainedFunction(...funcs: any[]) {
  return funcs.reduce(
    (acc, func) => {
      if (func == null) {
        return acc;
      }
      return function chainedFunction(...args: any[]) {
        acc.apply(this, args);
        func.apply(this, args);
      };
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    () => {},
  );
}
