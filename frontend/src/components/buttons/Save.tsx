import { Button } from "@mui/material";

interface SaveButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function Save({ onClick, disabled }: SaveButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      color="success"
      variant="outlined"
    >
      Save
    </Button>
  );
}
