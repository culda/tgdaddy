import { nanoid } from "nanoid";
import { FieldError, FieldErrorsImpl, Merge, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { FaPlus } from "react-icons/fa";
import { TpPageValues } from "../app/pages/PageScene";
import { StPagePrice, StPriceFrequency } from "../model/types";
import Button from "./Button";
import PriceInput from "./PriceInput";

export type PpPriceInputs= {
    edit?: boolean;
    register: UseFormRegister<TpPageValues>;
    setValue: UseFormSetValue<TpPageValues>
    prices?: StPagePrice[];
    errorMessage?: Merge<FieldError, (Merge<FieldError, FieldErrorsImpl<{
      usd: number;
      frequency: string;
  }>> | undefined)[]> | undefined;
}

const PriceInputs = ({ edit, setValue, register, prices, errorMessage }: PpPriceInputs) => {
  const addPriceEntry = () => {
    const newprices: StPagePrice[] = prices || [];
    newprices.push({ id: nanoid(10), usd: 0, frequency: StPriceFrequency.Monthly });
    setValue("prices", newprices);
  };

  const removePriceEntry = (index: number) => {
    const newprices: StPagePrice[] = prices || [];
    newprices.splice(index, 1);
    setValue("prices", newprices);
  };

  return (
    <div className="mt-4 flex flex-col gap-2 items-center">
    {prices?.map((_, index) => (
      <div className="flex flex-row gap-2 justify-center items-center" key={index}>
        <PriceInput
          priceRegisterProps={register(`prices.${index}.usd`)}
          frequencyRegisterProps={register(`prices.${index}.frequency`)}
          editMode={edit}
        />
        {edit && <Button variant="text" type="button" onClick={() => removePriceEntry(index)}>
          <FaPlus className="text-red-500 transform rotate-45" />
        </Button>}
      </div>
      ))}
    {edit && <Button type="button" onClick={addPriceEntry}>
      Add Price
    </Button>}
      <div
        className={`mt-2 h-8 text-sm ${errorMessage?.root ? "text-red-600" : ""} ${
          errorMessage?.root ? "visible" : "invisible"
        }`}>
          <div >{errorMessage?.root?.message}</div>
      </div>
  </div>
  );
};

export default PriceInputs;
