import React from "react";

export function useStateWithRef<T>(
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>, React.MutableRefObject<T>] {
  const [state, setState] = React.useState<T>(initialValue);
  const ref = React.useRef<T>(initialValue);
  React.useEffect(() => {
    ref.current = state;
  }, [state]);
  return [state, setState, ref];
}
