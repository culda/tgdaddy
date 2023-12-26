import React from "react";
import { StPriceFrequency } from "../model/types";
import { UseFormRegisterReturn } from "react-hook-form";

type PpPriceInput = {
  editMode?: boolean;
  onSave?: (price: string, frequency: StPriceFrequency) => Promise<void>;
  priceRegisterProps: UseFormRegisterReturn;
  frequencyRegisterProps: UseFormRegisterReturn;
  errorMessage?: string;
  // price: string | null; // Receive the price value from props
  // frequency: StPriceFrequency; // Receive the frequency value from props
};

const PriceInput = ({
  editMode,
  errorMessage,
  priceRegisterProps,
  frequencyRegisterProps,
  // price,
  // frequency,
}: PpPriceInput) => {
  return (
    <div className="flex flex-col justify-between gap-2 flex-wrap max-w-sm">
      <div className="flex flex-wrap gap-2">
        <div
          className={`flex items-center border rounded-md ${
            errorMessage ? "border-red-600" : "border-zinc-300"
          } bg-neutral-50 grow py-2.5 default-focus-within`}
        >
          <span className="pl-3 text-sm text-gray-500">$</span>
          <input
            type="text"
            placeholder="0.00"
            disabled={!editMode}
            className="text-black text-center text-sm whitespace-nowrap focus:outline-none justify-center items-center bg-transparent flex-grow"
            // value={price || ""}
            {...priceRegisterProps}
          />
        </div>
        <select
          disabled={!editMode}
          className="border border-zinc-300 text-black text-sm px-4 py-2.5 rounded-md shadow-sm  disabled:bg-neutral-100 appearance-none"
          // value={frequency}
          {...frequencyRegisterProps}
        >
          <option value={StPriceFrequency.Monthly}>Monthly</option>
          <option value={StPriceFrequency.Yearly}>Yearly</option>
        </select>
      </div>

      {/* <div
        className={`mt-2 h-8 text-sm ${errorMessage ? "text-red-600" : ""} ${
          errorMessage ? "visible" : "invisible"
        }`}
      >
        {errorMessage}
      </div> */}
    </div>
  );
};

export default PriceInput;
