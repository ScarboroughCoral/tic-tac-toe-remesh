import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { RemeshRoot } from "remesh-react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RemeshRoot>
      <App />
    </RemeshRoot>
  </StrictMode>
);
