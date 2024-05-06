import { Box, Button, CircularProgress } from "@mui/material";
import { ButtonProps } from "@mui/material/Button/Button";

interface ProgressButtonProps extends ButtonProps {
  text: string;
  inProgress: boolean;
}

export default function ProgressButton({
  text,
  inProgress,
  ...buttonProps
}: ProgressButtonProps) {
  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <Button
        sx={{
          // using visibility allows us to keep the same size box when in progress
          visibility: inProgress ? "hidden" : "visible",
        }}
        {...buttonProps}
      >
        {text}
      </Button>
      {inProgress && (
        <CircularProgress
          sx={{
            position: "absolute",
          }}
        />
      )}
    </Box>
  );
}
