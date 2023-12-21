import { useEffect } from "react";
import { FaPlus } from "react-icons/fa";

export type SnackbarType = {
  key: string;
  text: React.ReactNode;
  icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  variant: "success" | "error" | "warning" | "info";
  dismissable?: boolean;
  autodeleteTime?: number;
};

export type TSnackbarProps = Omit<SnackbarType, "key"> & {
  handleClose: () => void; // Function that is run when the snackbar is closed
  open: boolean; //whether to open the snackbar or not
};

export default function Snackbar({
  open,
  text,
  icon: Icon,
  handleClose,
  variant,
  dismissable = false,
  autodeleteTime = 3000,
}: TSnackbarProps) {
  const variants = {
    success: "bg-green-600",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (open && !dismissable) {
      timer = setTimeout(() => {
        handleClose();
      }, autodeleteTime);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [open, dismissable, autodeleteTime, handleClose]);

  return open ? (
    <div
      className={`${variants[variant]} flex items-center gap-2 mx-auto truncate whitespace-nowrap rounded-lg py-3 px-3.5 text-xs text-white shadow-md `}
    >
      {Icon && (
        <span className="mr-4 text-base" aria-hidden="true">
          <Icon className="h-5 w-5" />
        </span>
      )}
      <span>{text}</span>
      {dismissable && (
        <button
          className="bg-transparent !p-0 text-current"
          onClick={handleClose}
        >
          <FaPlus className="transform rotate-45" />
        </button>
      )}
    </div>
  ) : null;
}
