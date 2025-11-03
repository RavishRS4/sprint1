import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ForgotPasswordProvider } from "./context/ForgotPasswordContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ForgotPasswordProvider>
      <App />
    </ForgotPasswordProvider>
  </React.StrictMode>
);
