import { IMessageType } from "@protobuf-ts/runtime";
import useLocalState from "./UseLocalState.tsx";
import { JsonValue } from "@protobuf-ts/runtime/build/types/json-typings";

function useLocalMessage<T extends object>(
  defaultValue: T,
  messageType: IMessageType<T>,
  key: string,
) {
  const defaultJsonValue = messageType.toJson(defaultValue);
  const [value, setValue] = useLocalState<JsonValue>(defaultJsonValue, key);

  const setMessage = (message: T) => {
    const value = messageType.toJson(message);
    setValue(value);
  };

  const message = messageType.fromJson(value);

  return [message, setMessage] as const;
}

export default useLocalMessage;
