import { useEffect, useState } from "react";

function useLocalState<T>(defaultValue: T, key: string) {
  const [value, setValue] = useState<T>(() => {
    const storedValue = window.localStorage.getItem(key);

    if (storedValue === null) {
      return defaultValue;
    }

    const parsedValue = JSON.parse(storedValue);
    if (
      (Array.isArray(defaultValue) && Array.isArray(parsedValue)) ||
      (!Array.isArray(defaultValue) &&
        typeof parsedValue === typeof defaultValue)
    ) {
      return parsedValue;
    }

    throw new Error(
      `Type of locally stored '${key}' does not match default value`,
    );
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

export default useLocalState;
