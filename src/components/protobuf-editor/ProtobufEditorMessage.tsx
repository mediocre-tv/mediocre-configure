import { FieldInfo, IMessageType } from "@protobuf-ts/runtime";
import { ProtobufEditorOneof } from "./ProtobufEditorOneof.tsx";
import { ProtobufEditorField } from "./ProtobufEditorField.tsx";
import { Stack } from "@mui/material";

interface ProtobufEditorMessageProps<T extends object> {
  message: T;
  setMessage: (message: T) => void;
  messageType: IMessageType<T>;
}

export function ProtobufEditorMessage<T extends object>({
  message,
  setMessage,
  messageType,
}: ProtobufEditorMessageProps<T>) {
  const fieldNameToFieldInfosMap = messageType.fields.reduce(
    (previousMap, currentFieldInfo) => {
      const fieldName = currentFieldInfo.oneof || currentFieldInfo.localName;
      const previousFieldInfos = previousMap.get(fieldName) ?? [];
      const updatedFieldInfos = [...previousFieldInfos, currentFieldInfo];
      previousMap.set(fieldName, updatedFieldInfos);
      return previousMap;
    },
    new Map<string, FieldInfo[]>(),
  );

  const setMessageAsPartial = (message: T) => {
    setMessage(messageType.create(message));
  };

  const messageAsRecord = message as Record<string, unknown>;

  const fields = Array.from(fieldNameToFieldInfosMap).map(
    ([fieldName, fieldInfos]) => {
      if (fieldInfos.length === 0) {
        throw new Error(`No field infos found for ${fieldName}`);
      }

      const firstFieldInfo = fieldInfos[0];
      const oneofName = firstFieldInfo.oneof;
      if (oneofName) {
        return (
          <ProtobufEditorOneof
            key={fieldName}
            oneofName={oneofName}
            message={message}
            setMessage={setMessageAsPartial}
            defaultInfo={firstFieldInfo}
            infos={fieldInfos}
          />
        );
      } else {
        return (
          <ProtobufEditorField
            key={fieldName}
            name={fieldName}
            value={messageAsRecord[fieldName]}
            setValue={(value) =>
              setMessageAsPartial({
                ...message,
                [fieldName]: value,
              })
            }
            info={firstFieldInfo}
          />
        );
      }
    },
  );

  return <Stack spacing={2}>{fields}</Stack>;
}
