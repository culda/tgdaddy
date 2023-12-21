import React, { useEffect, useRef, useState } from "react";
import Button from "./Button";
import { useSnackbar } from "./SnackbarProvider";
import { TpImage } from "@/functions/pages/handler";

type PpAddImage = {
  currentImagePath?: string;
  onSave: ({ fileBase64, fileType }: TpImage) => void;
  editMode?: boolean;
};

export default function AddImage({
  currentImagePath,
  onSave,
  editMode,
}: PpAddImage) {
  const snack = useSnackbar();
  const [image, setImage] = useState<File | null>(null);

  const handleImageUpload: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    if (!event.target.files || !event.target.files[0]) {
      return;
    }
    const file = event.target.files[0];
    if (file.size > 5242880) {
      // 5MB limit
      snack({
        key: "image-too-large",
        text: "Image must be less than 5MB",
        dismissable: false,
        variant: "error",
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const buffer = reader.result as ArrayBuffer;
        const base64 = Buffer.from(buffer).toString("base64");
        await onSave({
          fileBase64: base64,
          fileType: file.type,
        });
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error(error);
    }

    setImage(file);
  };

  const src = image ? URL.createObjectURL(image) : currentImagePath;

  const selectClass =
    "border border-zinc-300 text-black text-sm px-2 md:px-4 py-2.5 rounded-md shadow-sm focus:outline-none disabled:bg-neutral-100 appearance-none";

  return (
    <div className="flex flex-col justify-between gap-2 flex-wrap px-2 md:px-0">
      <div className="flex flex-col gap-2 items-center w-full">
        {editMode && (
          <div className="relative w-full">
            <input
              type="file"
              className={`${selectClass} w-full`}
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
        )}
        <div className="mt-2 w-full">
          <img
            src={src ?? "/images/page-default.webp"}
            alt={image ? "Selected" : "Current"}
            className="rounded-md w-full max-w-xs mx-auto"
          />
        </div>
      </div>
    </div>
  );
}
