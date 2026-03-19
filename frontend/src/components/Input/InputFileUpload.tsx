import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1
});

type InputFileUploadProps = {
  onFileChange?: (files: FileList | null) => void;
};

export default function InputFileUpload({
  onFileChange
}: InputFileUploadProps) {
  return (
    <Button
      component="label"
      role={undefined}
      variant="contained"
      tabIndex={-1}
      startIcon={<CloudUploadIcon />}
    >
      Select files
      <VisuallyHiddenInput
        type="file"
        onChange={(event) => {
          const files = event.target.files;
          if (files && onFileChange) {
            onFileChange(files);
          }
          // console.log(event.target.files);
        }}
        multiple
      />
    </Button>
  );
}
