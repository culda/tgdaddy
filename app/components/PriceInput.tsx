import { UseFormRegisterReturn } from 'react-hook-form';
import { StPriceFrequency } from '../model/types';

type PpPriceInput = {
  editMode?: boolean;
  onSave?: (price: string, frequency: StPriceFrequency) => Promise<void>;
  priceRegisterProps: UseFormRegisterReturn;
  frequencyRegisterProps: UseFormRegisterReturn;
  errorMessage?: string;
};

const PriceInput = ({
  editMode,
  errorMessage,
  priceRegisterProps,
  frequencyRegisterProps,
}: PpPriceInput) => {
  return (
    <div className="flex flex-col justify-between gap-2 flex-wrap max-w-sm">
      <div className="flex flex-wrap gap-2">
        <div
          className={`flex items-center border rounded-md ${
            errorMessage ? 'border-red-600' : 'border-zinc-300'
          }  grow py-2.5 default-focus-within`}
        >
          <span className="pl-3 text-sm text-gray-500">$</span>
          <input
            type="text"
            placeholder="0.00"
            disabled={!editMode}
            className={`text-black text-center text-sm whitespace-nowrap focus:outline-none justify-center items-center ${
              editMode ? 'bg-white' : 'bg-neutral-50'
            }  flex-grow`}
            {...priceRegisterProps}
          />
        </div>
        <select
          disabled={!editMode}
          className="border border-zinc-300 text-black text-sm px-4 py-2.5 rounded-md shadow-sm  disabled:bg-neutral-100 appearance-none"
          {...frequencyRegisterProps}
        >
          <option value={StPriceFrequency.Once}>Once</option>
          <option value={StPriceFrequency.Week}>Week</option>
          <option value={StPriceFrequency.Month}>Month</option>
        </select>
      </div>
    </div>
  );
};

export default PriceInput;
