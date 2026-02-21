import React, { createContext, useCallback, useContext } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NotificationContext = createContext({
  notify: () => { },
  success: () => { },
  error: () => { },
});

export function NotificationProvider({ children }) {
  const notify = useCallback((payload) => {
    const opts = { position: "top-right", autoClose: 3000 };
    if (payload.variant === "success") {
      toast.success(payload.text, opts);
    } else if (payload.variant === "danger" || payload.variant === "error") {
      toast.error(payload.text, opts);
    } else {
      toast.info(payload.text, opts);
    }
  }, []);

  const success = useCallback((text) => notify({ variant: "success", text }), [notify]);
  const error = useCallback((text) => notify({ variant: "danger", text }), [notify]);

  return (
    <NotificationContext.Provider value={{ notify, success, error }}>
      {children}
      <ToastContainer />
    </NotificationContext.Provider>
  );
}

export function useNotify() {
  return useContext(NotificationContext);
}

