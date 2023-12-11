"use client";

import React, { useRef, useState, forwardRef, ForwardedRef } from "react";
import Button from "./Button";

type PpEditableForm = {
  editMode?: boolean;
  onSave?: (value: string) => Promise<void>;
  defaultValue?: string;
  textarea?: boolean;
};

const EditableInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  PpEditableForm
>(({ editMode = false, onSave, defaultValue, textarea, ...rest }, ref) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(editMode);
  const [inputValue, setInputValue] = useState<string>(defaultValue ?? "");
  const [errorMessage, setErrorMessage] = useState("");
  // const inputRef = useRef<HTMLInputElement | null>(null);
  // const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const toggleEdit = async () => {
    if (!onSave) {
      return;
    }
    if (!isEditing) {
      setIsEditing(true);
      setTimeout(
        () => (ref as React.RefObject<HTMLTextAreaElement>)?.current?.focus(),
        0
      );
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
  } bg-neutral-50 grow py-2.5 border-solid px-1 md:px-5`;

  return (
    <form className="flex flex-col justify-between gap-2 flex-wrap">
      {textarea ? (
        <textarea
          ref={ref as React.RefObject<HTMLTextAreaElement>}
          value={inputValue}
          onChange={handleInputChange}
          disabled={!isEditing}
          className={inputClass}
          {...rest}
        />
      ) : (
        <input
          type="text"
          ref={ref as React.RefObject<HTMLInputElement>}
          value={inputValue}
          onChange={handleInputChange}
          disabled={!isEditing}
          className={inputClass}
          {...rest}
        />
      )}
      {onSave && (
        <Button onClick={async () => await toggleEdit()} loading={isSubmitting}>
          {isEditing ? "Save" : "Edit"}
        </Button>
      )}

      <div
        className={`mt-2 h-8 text-sm ${errorMessage ? "text-red-600" : ""} ${
          errorMessage ? "visible" : "invisible"
        }`}
      >
        {errorMessage}
      </div>
    </form>
  );
});

export default EditableInput;
