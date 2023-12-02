"use client";

import React, { useState } from "react";

type PpEditableForm = {
  onSave: (value: string) => void;
};

export default function EditableForm({ onSave }: PpEditableForm) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("$5");

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    onSave(inputValue);
  };

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setInputValue(event.target.value);
  };

  return (
    <form className="self-stretch flex items-stretch justify-between gap-2 mt-9">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        disabled={!isEditing}
        className="text-black text-center text-sm whitespace-nowrap justify-center items-center border bg-neutral-50 grow px-16 py-2.5 border-solid border-zinc-300 max-md:px-5"
      />
      <button
        type="button"
        onClick={toggleEdit}
        className="text-black text-center text-sm whitespace-nowrap justify-center items-stretch bg-orange-200 grow px-12 py-2.5 max-md:px-5"
      >
        {isEditing ? "Save" : "Edit"}
      </button>
    </form>
  );
}
