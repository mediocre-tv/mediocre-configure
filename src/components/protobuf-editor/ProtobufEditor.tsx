import {
  Alert,
  Box,
  Button,
  FormControl,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useState } from "react";
import {
  containsMessageType,
  IMessageType,
  MESSAGE_TYPE,
} from "@protobuf-ts/runtime";
import { isErrorWithMessage } from "../grpc/GrpcHealth.ts";
import { ProtobufEditorMessage } from "./ProtobufEditorMessage.tsx";

const protobufEditorViews = ["Form", "JSON"] as const;
type ProtobufEditorView = (typeof protobufEditorViews)[number];

interface ProtobufEditorProps<T extends object> {
  message: T;
  setMessage: (message: T) => void;
  onCancel: () => void;
  onPreview: (message: T) => void;
}

export default function ProtobufEditor<T extends object>({
  message,
  setMessage,
  onCancel,
  onPreview,
}: ProtobufEditorProps<T>) {
  const [newMessage, setNewMessage] = useState(message);
  const [view, setView] = useState<ProtobufEditorView>("Form");
  const messageType = containsMessageType(message)
    ? message[MESSAGE_TYPE]
    : null;

  const [error, setError] = useState("");
  const valid = messageType !== null && !error;

  const onUpdateMessage = (message: T) => {
    setNewMessage(message);
    onPreview(message);
  };

  return (
    <FormControl fullWidth>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent={"end"}>
          <ProtobufEditorToggles
            view={view}
            setView={setView}
            disabled={!valid}
          />
        </Stack>
        <Box minHeight={300}>
          {valid && view === "Form" ? (
            <ProtobufEditorForm
              message={newMessage}
              setMessage={onUpdateMessage}
              messageType={messageType}
              setError={setError}
            />
          ) : (
            messageType && (
              <ProtobufEditorJson
                message={newMessage}
                setMessage={onUpdateMessage}
                messageType={messageType}
                setError={setError}
              />
            )
          )}
        </Box>
        {!valid && (
          <Box>
            <Alert severity="error">{error ?? "Something went wrong"}</Alert>
          </Box>
        )}
        <ProtobufEditorActions
          onSave={() => setMessage(newMessage)}
          onCancel={onCancel}
          disabled={!valid}
        />
      </Stack>
    </FormControl>
  );
}

interface ProtobufEditorTogglesProps {
  view: ProtobufEditorView;
  setView: (view: ProtobufEditorView) => void;
  disabled: boolean;
}

function ProtobufEditorToggles({
  view,
  setView,
  disabled,
}: ProtobufEditorTogglesProps) {
  return (
    <ToggleButtonGroup
      exclusive
      value={view}
      onChange={(_, value) => setView(value)}
      disabled={disabled}
    >
      {protobufEditorViews.map((view) => (
        <ToggleButton key={view} value={view} sx={{ textTransform: "none" }}>
          {view}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

interface ProtobufEditorActionsProps {
  onSave: () => void;
  onCancel: () => void;
  disabled: boolean;
}

function ProtobufEditorActions({
  onSave,
  onCancel,
  disabled,
}: ProtobufEditorActionsProps) {
  return (
    <Stack direction="row" justifyContent={"end"} spacing={2}>
      <Button variant="outlined" type="reset" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        disabled={disabled}
        variant="contained"
        type="submit"
        onClick={onSave}
      >
        Save
      </Button>
    </Stack>
  );
}

interface ProtobufEditorJsonProps<T extends object> {
  message: T;
  setMessage: (message: T) => void;
  messageType: IMessageType<T>;
  setError: (error: string) => void;
}

function ProtobufEditorJson<T extends object>({
  message,
  setMessage,
  messageType,
  setError,
}: ProtobufEditorJsonProps<T>) {
  return (
    <Box>
      <TextField
        fullWidth
        multiline
        rows={10}
        defaultValue={JSON.stringify(messageType.toJson(message), null, 2)}
        onChange={(event) => {
          try {
            const message = messageType.fromJsonString(event.target.value);
            setMessage(message);
            setError("");
          } catch (error) {
            if (isErrorWithMessage(error)) {
              setError(error?.message);
            } else {
              setError("Unknown error");
            }
          }
        }}
        InputProps={{
          sx: {
            fontFamily: "monospace",
          },
        }}
      />
    </Box>
  );
}

interface ProtobufEditorFormProps<T extends object> {
  message: T;
  setMessage: (message: T) => void;
  messageType: IMessageType<T>;
  setError: (error: string) => void;
}

function ProtobufEditorForm<T extends object>({
  message,
  setMessage,
  messageType,
}: ProtobufEditorFormProps<T>) {
  return (
    <ProtobufEditorMessage
      message={message}
      setMessage={setMessage}
      messageType={messageType}
    />
  );
}
