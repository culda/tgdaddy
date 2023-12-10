"use client";

import React, { useRef, useState } from "react";
import Button from "./Button";

type PpEditableForm = {
  onSave: (value: string) => Promise<void>;
  defaultValue?: string;
  textarea?: boolean;
};

export default function EditableInput({
  onSave,
  defaultValue,
  textarea,
}: PpEditableForm) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState<string>(defaultValue ?? "");
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const toggleEdit = async () => {
    if (!isEditing) {
      setIsEditing(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      try {
        setIsSubmitting(true);
        await onSave(inputValue);
        setIsSubmitting(false);
        setIsEditing(false);
        setErrorMessage("");
      } catch (error) {
        setIsSubmitting(false);
        if (error instanceof Error) {
          setErrorMessage(error.message || "An error occurred while saving");
        }
      } finally {
        setIsEditing(false);
      }
    }
  };

  const handleInputChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (event) => {
    setInputValue(event.target.value);
  };

  const inputClass = `text-black text-center text-sm whitespace-nowrap rounded-md justify-center items-center border ${
    errorMessage ? "border-red-600" : "border-zinc-300"
  } bg-neutral-50 grow py-2.5 border-solid max-md:px-5`;

  return (
    <form className="flex flex-col justify-between gap-2 flex-wrap">
      {textarea ? (
        <textarea
          ref={textAreaRef}
          value={inputValue}
          onChange={handleInputChange}
          disabled={!isEditing}
          className={inputClass}
        />
      ) : (
        <input
          type="text"
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          disabled={!isEditing}
          className={inputClass}
        />
      )}
      <Button onClick={async () => await toggleEdit()} loading={isSubmitting}>
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
