import React, { useRef, useState } from "react";
import Button from "./Button";
import { StPriceFrequency } from "../model/types";

type PpPriceInput = {
  editMode?: boolean;
  onSave: (price: string, frequency: StPriceFrequency) => Promise<void>;
  defaultPrice: string;
  defaultFrequency: StPriceFrequency;
};

export default function PriceInput({
  editMode,
  onSave,
  defaultPrice,
  defaultFrequency,
}: PpPriceInput) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(editMode);
  const [price, setPrice] = useState<string>(defaultPrice ?? "");
  const [membershipType, setMembershipType] = useState<StPriceFrequency>(
    defaultFrequency ?? StPriceFrequency.Monthly
  );
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const toggleEdit = async () => {
    if (!isEditing) {
      setIsEditing(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      try {
        setIsSubmitting(true);
        await onSave(price, membershipType);
        setIsSubmitting(false);
        setIsEditing(false);
        setErrorMessage("");
      } catch (error) {
        setIsEditing(false);
        setIsSubmitting(false);
        if (error instanceof Error) {
          setErrorMessage(error.message || "An error occurred while saving");
        }
      }
    }
  };

  const handlePriceChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setPrice(event.target.value);
  };

  const handleMembershipTypeChange: React.ChangeEventHandler<
    HTMLSelectElement
  > = (event) => {
    setMembershipType(event.target.value as StPriceFrequency);
  };

  const inputWrapperClass = `flex items-center border rounded-md ${
    errorMessage ? "border-red-600" : "border-zinc-300"
  } bg-neutral-50 grow py-2.5 border-solid max-md:px-5`;

  const inputClass = `focus:outline-none text-black text-center  text-sm whitespace-nowrap justify-center items-center bg-transparent flex-grow`;

  const selectClass = `border border-zinc-300 text-black text-sm px-4 py-2.5 bg-orange-200 rounded-md shadow-sm focus:outline-none disabled:bg-neutral-100 appearance-none`;

  return (
    <form className="flex flex-col justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-2">
        <div className={inputWrapperClass}>
          <span className="pl-3 text-sm text-gray-500">$</span>
          <input
            type="text"
            ref={inputRef}
            value={price}
            placeholder="0.00"
            onChange={handlePriceChange}
            disabled={!isEditing}
            className={inputClass}
          />
        </div>
        <div className="relative">
          <select
            onChange={handleMembershipTypeChange}
            disabled={!isEditing}
            value={membershipType}
            className={selectClass}
          >
            <option value="Monthly">Monthly</option>
            <option value="Daily">Daily</option>
            <option value="Lifetime">Lifetime</option>
          </select>
        </div>
      </div>
      <Button onClick={async () => await toggleEdit()} loading={isSubmitting}>
        {isEditing ? "Save" : "Edit"}
      </Button>

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
