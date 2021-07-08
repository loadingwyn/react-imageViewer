import { useCallback, useRef } from 'react';
import useEnhancedEffect from './useEnhancedEffect';

export default function useEventCallback<Args extends unknown[], Return>(
  fn: (...args: Args) => Return,
  dependencies: any[],
): (...args: Args) => Return {
  const ref = useRef(fn);
  useEnhancedEffect(() => {
    ref.current = fn;
  }, [fn, ...dependencies]);
  return useCallback(
    (...args: Args) =>
      // @ts-expect-error hide `this`
      // tslint:disable-next-line:ban-comma-operator
      (0, ref.current!)(...args),
    [],
  );
}
