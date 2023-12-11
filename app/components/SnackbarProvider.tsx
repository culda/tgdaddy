import { createContext, useCallback, useContext, useReducer } from "react";
import Snackbar, { SnackbarType } from "./Snackbar";

const SnackbarContext = createContext<{
  queue: SnackbarType[];
  dispatch: React.Dispatch<TAction>;
}>({
  queue: [] as SnackbarType[],
  dispatch: () => {},
});

export default function SnackbarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ queue }, dispatch] = useReducer(reducer, { queue: [] });

  return (
    <SnackbarContext.Provider value={{ queue, dispatch }}>
      {queue.map((snack, index) => (
        <div
          key={snack.key}
          className={`fixed top-0 z-50 flex w-full m-4 -mt-${index + 1} left-${
            index + 4
          }`}
        >
          <Snackbar
            text={snack.text}
            variant={snack.variant}
            icon={snack.icon}
            dismissable={snack.dismissable}
            autodeleteTime={snack.autodeleteTime}
            handleClose={() =>
              dispatch({ type: "REMOVE_SNACKBAR", payload: { key: snack.key } })
            }
            open
          />
        </div>
      ))}
      {children}
    </SnackbarContext.Provider>
  );
}

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar was called outside SnackbarProvider");
  }
  const { dispatch } = context;

  return useCallback(
    (snack: SnackbarType) => {
      dispatch({ type: "ADD_SNACKBAR", payload: { current: snack } });
    },
    [dispatch]
  );
};

type TAction =
  | {
      type: "ADD_SNACKBAR";
      payload: {
        current: SnackbarType;
      };
    }
  | {
      type: "REMOVE_SNACKBAR";
      payload: {
        key: string;
      };
    };

type TStateType = {
  queue: SnackbarType[];
};

function reducer(state: TStateType, action: TAction): TStateType {
  switch (action.type) {
    case "ADD_SNACKBAR": {
      const { queue } = state;
      const { current } = action.payload;
      const isInQueue = queue.some((snack) => snack.key === current.key);

      if (isInQueue) return state;
      return {
        queue: [...queue, current],
      };
    }

    case "REMOVE_SNACKBAR": {
      const { queue } = state;
      const { key: snackKey } = action.payload;

      return {
        queue: queue.filter((snackbar) => snackbar.key !== snackKey),
      };
    }

    default:
      throw new Error("Unknown action type");
  }
}
