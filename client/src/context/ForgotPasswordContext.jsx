import { createContext, useContext, useMemo, useState } from "react";

const ForgotPasswordContext = createContext(null);

export const ForgotPasswordProvider = ({ children }) => {
  const [email, setEmail] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [delivered, setDelivered] = useState(false);

  const value = useMemo(
    () => ({ email, setEmail, resetLink, setResetLink, delivered, setDelivered }),
    [email, resetLink, delivered]
  );

  return <ForgotPasswordContext.Provider value={value}>{children}</ForgotPasswordContext.Provider>;
};

export const useForgotPasswordContext = () => {
  const context = useContext(ForgotPasswordContext);
  if (!context) {
    throw new Error("useForgotPasswordContext must be used within ForgotPasswordProvider");
  }
  return context;
};
