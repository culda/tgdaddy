"use client";

import React, { useRef, useState } from "react";
import Button from "./Button";

type PpEditableForm = {
  onSave: (value: string) => void;
  defaultValue?: string;
};

export default function EditableInput({
  onSave,
  defaultValue,
}: PpEditableForm) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState<string>(defaultValue ?? "");
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const toggleEdit = async () => {
    if (!isEditing) {
      setIsEditing(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      try {
        await onSave(inputValue);
        setIsEditing(false);
        setErrorMessage("");
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message || "An error occurred while saving");
        }
      }
    }
  };

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setInputValue(event.target.value);
  };

  return (
    <form className="flex flex-col justify-between gap-2 mt-9 flex-wrap">
      <input
        type="text"
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        disabled={!isEditing}
        className={`text-black text-center text-sm whitespace-nowrap justify-center items-center border ${
          errorMessage ? "border-red-600" : "border-zinc-300"
        } bg-neutral-50 grow px-16 py-2.5 border-solid max-md:px-5`}
      />
      <Button onClick={async () => await toggleEdit()}>
        {isEditing ? "Save" : "Edit"}
      </Button>

      <div
        class={`mt-2 h-8 text-sm ${errorMessage ? "text-red-600" : ""} ${
          errorMessage ? "visible" : "invisible"
        }`}
      >
        {errorMessage}
      </div>
    </form>
  );
}
