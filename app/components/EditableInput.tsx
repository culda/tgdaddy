"use client";

import React, { useRef, useState, forwardRef, ForwardedRef } from "react";
import Button from "./Button";
import { FaCopy } from "react-icons/fa";

type PpEditableForm = {
  editMode?: boolean;
  onSave?: (value: string) => Promise<void>;
  defaultValue?: string;
  textarea?: boolean;
  onCopy?: () => void;
  pretext?: string;
};

const EditableInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  PpEditableForm
>(
  (
    {
      editMode = false,
      onSave,
      defaultValue,
      textarea,
      onCopy,
      pretext,
      ...rest
    },
    ref
  ) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(editMode);
    const [inputValue, setInputValue] = useState<string>(defaultValue ?? "");
    const [errorMessage, setErrorMessage] = useState("");

    const copyValue = () => {
      if (!inputValue) {
        return;
      }
      navigator.clipboard.writeText(
        pretext ? `${pretext}${inputValue}` : inputValue
      );
      onCopy?.();
    };

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

    const inputClass = `flex flex-grow min-w-0 text-black bg-neutral-50 text-sm text-gray-600 rounded-md py-2.5 px-1 ${
      pretext ? "" : "text-center"
    }`;

    return (
      <form className="flex flex-col justify-between gap-2 flex-wrap">
        {textarea ? (
          <div className="flex border-zinc-300 border rounded-md bg-neutral-50">
            <textarea
              ref={ref as React.RefObject<HTMLTextAreaElement>}
              value={inputValue}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={inputClass}
              {...rest}
            />
          </div>
        ) : (
          <div
            className={`relative flex bg-neutral-50 items-center border ${
              errorMessage ? "border-red-600" : "border-zinc-300"
            } rounded-md`}
          >
            {pretext && <span className="font-bold pl-3 pr-1 ">{pretext}</span>}
            <input
              type="text"
              size={1}
              className={inputClass}
              ref={ref as React.RefObject<HTMLInputElement>}
              value={inputValue}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            {onCopy && !isEditing && (
              <div className="absolute right-4 inset-y-0 flex items-center">
                <button type="button" onClick={() => copyValue()}>
                  <FaCopy className="text-lg" />
                </button>
              </div>
            )}
          </div>
          // <div class="flex relative">
          //   {pretext && (
          //     <span class="flex items-center pl-3 text-gray-700 font-bold rounded-md">
          //       {pretext}
          //     </span>
          //   )}
          //   <input
          // type="text"
          // ref={ref as React.RefObject<HTMLInputElement>}
          // value={inputValue}
          // onChange={handleInputChange}
          // disabled={!isEditing}
          // className={inputClass}
          // {...rest}
          //   />
          // {onCopy && !isEditing && (
          //   <div className="absolute right-4 inset-y-0 flex items-center">
          //     <button type="button" onClick={() => copyValue()}>
          //       <FaCopy className="text-lg" />
          //     </button>
          //   </div>
          // )}
          // </div>
        )}
        {onSave && (
          <Button
            onClick={async () => await toggleEdit()}
            loading={isSubmitting}
          >
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
  }
);

export default EditableInput;
