import {useState, useCallback} from "react";

export const useStateData = <T>({
  initialData,
}: {
  initialData: T;
}) => {
  // example usage with React useState
  const [state, setState] = useState<T>(initialData);

  const addChange = useCallback((data:Partial<T>) => {
    setState((prevState) => {
      return {
        ...prevState,
        ...data
      }
    })
  }, [initialData]);

  return { state, addChange };
};

export type UseStateData<T> = ReturnType<typeof useStateData<T>>;
