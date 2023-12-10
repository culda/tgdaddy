import React, { useRef, useState } from "react";
import Button from "./Button";

type PpAddImage = {
  onSave: (
    fileBuffer: ArrayBuffer,
    fileName: string,
    fileType: string
  ) => Promise<void>;
};

export default function AddImage({ onSave }: PpAddImage) {
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
          await onSave(buffer, image.name, image.type);
          setImage(null); // Clear the selected image after saving
          if (inputRef.current) {
            inputRef.current.value = ""; // Reset the input element
          }
        };
        reader.readAsArrayBuffer(image);
      } catch (error) {
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleImageUpload: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const selectClass =
    "border border-zinc-300 text-black text-sm px-4 py-2.5 rounded-md shadow-sm focus:outline-none disabled:bg-neutral-100 appearance-none";

  return (
    <form
      className="flex flex-col justify-between gap-2 flex-wrap"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="flex flex-col gap-2 items-center">
        <div className="relative">
          <input
            ref={inputRef}
            type="file"
            className={selectClass}
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>
        {image && (
          <div className="mt-2">
            <img
              src={URL.createObjectURL(image)}
              alt="Selected"
              className="rounded-md max-w-xs"
            />
          </div>
        )}
      </div>
      <Button onClick={submitImage} loading={isSubmitting} disabled={!image}>
        Submit
      </Button>
    </form>
  );
}
