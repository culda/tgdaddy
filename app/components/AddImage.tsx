import React, { useRef, useState } from "react";
import Button from "./Button";
import { useSnackbar } from "./SnackbarProvider";

type PpAddImage = {
  currentImagePath?: string;
  onSave: (fileBase64: string, fileType: string) => Promise<void>;
  saveOnChange?: boolean;
};

export default function AddImage({
  currentImagePath,
  onSave,
  saveOnChange,
}: PpAddImage) {
  const snack = useSnackbar();
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const submitImage = async () => {
    if (image) {
      try {
        setIsSubmitting(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
          const buffer = reader.result as ArrayBuffer;
          const base64 = Buffer.from(buffer).toString("base64");
          await onSave(base64, image.type);
          setIsSubmitting(false);
          setImage(null); // Clear the selected image after saving

          if (inputRef.current) {
            inputRef.current.value = ""; // Reset the input element
          }
        };
        reader.readAsArrayBuffer(image);
      } catch (error) {
        console.error(error);
        setIsSubmitting(false);
      }
    }
  };

  const handleImageUpload: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 2097152) {
        // 2MB limit
        snack({
          key: "image-too-large",
          text: "Image must be less than 2MB",
          dismissable: false,
          variant: "error",
        });
        return;
      }
      setImage(file);
      if (saveOnChange) {
        console.log("submitting");
        submitImage();
      }
    }
  };
  const selectClass =
    "border border-zinc-300 text-black text-sm px-2 md:px-4 py-2.5 rounded-md shadow-sm focus:outline-none disabled:bg-neutral-100 appearance-none";

  return (
    <form
      className="flex flex-col justify-between gap-2 flex-wrap px-2 md:px-0"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="flex flex-col gap-2 items-center w-full">
        <div className="relative w-full">
          <input
            ref={inputRef}
            type="file"
            className={`${selectClass} w-full`}
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>
        <div className="mt-2 w-full">
          <img
            src={image ? URL.createObjectURL(image) : currentImagePath}
            alt={image ? "Selected" : "Current"}
            className="rounded-md w-full max-w-xs mx-auto"
            style={{ display: image || currentImagePath ? "block" : "none" }}
          />
        </div>
      </div>
      {!saveOnChange && (
        <Button onClick={submitImage} loading={isSubmitting} disabled={!image}>
          Submit
        </Button>
      )}
    </form>
  );
}
