import { ChangeEvent, ReactNode, useState } from "react";
import {
  Button,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface ActionIconProps {
  onDelete?: () => void;
  onEdit?: () => void;
}

function ActionIcon({ onDelete, onEdit }: ActionIconProps) {
  if (onDelete) {
    return (
      <IconButton onClick={onDelete}>
        <DeleteIcon />
      </IconButton>
    );
  }

  if (onEdit) {
    return (
      <IconButton onClick={onEdit}>
        <EditIcon />
      </IconButton>
    );
  }
}

interface EditableNameProps {
  name: string;
  setName: (name: string) => void;
}

function EditableName({ name, setName }: EditableNameProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(name);

  if (isRenaming) {
    return (
      <form
        onSubmit={() => {
          setIsRenaming(false);
          setName(newName);
        }}
      >
        <Stack direction={"row"}>
          <TextField
            value={newName}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setNewName(event.target.value);
            }}
            autoFocus={true}
          />
          <Button type="submit">Save</Button>
        </Stack>
      </form>
    );
  }

  return (
    <Stack direction={"row"} alignItems={"center"} gap={1}>
      <Typography variant="body1">{name}</Typography>
      <ActionIcon onEdit={() => setIsRenaming(true)} />
    </Stack>
  );
}

interface BoxWithHeaderProps {
  header: ReactNode;
  body: ReactNode;
}

function BoxWithHeader({ header, body }: BoxWithHeaderProps) {
  return (
    <Stack border={1} borderRadius={1} padding={2} spacing={1}>
      {header}
      <Divider />
      {body}
    </Stack>
  );
}

interface BoxWithNameAndActionsProps {
  name: string;
  setName: (name: string) => void;
  actions: ActionIconProps[];
  body: ReactNode;
}

export function BoxWithHeaderActions({
  name,
  setName,
  actions,
  body,
}: BoxWithNameAndActionsProps) {
  return (
    <BoxWithHeader
      header={
        <Stack
          direction={"row"}
          alignItems="center"
          justifyContent={"space-between"}
        >
          <EditableName name={name} setName={setName} />
          <Stack direction={"row"}>
            {actions.map((action, index) => (
              <ActionIcon key={index} {...action} />
            ))}
          </Stack>
        </Stack>
      }
      body={body}
    />
  );
}
