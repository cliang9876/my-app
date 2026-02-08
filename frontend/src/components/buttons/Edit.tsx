import { Button } from "@mui/material";

interface EditButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function Edit({ onClick, disabled }: EditButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      color="info"
      variant="outlined"
    >
      Edit
    </Button>
  );
}
