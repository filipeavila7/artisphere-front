import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { ToastProvider } from "./context/ToastContext";

import "./index.css";
import "./styles/variables.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Feed owns restoration, including browser back/forward navigation.
if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
    <BrowserRouter>
        <QueryClientProvider client={queryClient}>
            <ToastProvider>
                <App />
            </ToastProvider>
        </QueryClientProvider>
    </BrowserRouter>
    </StrictMode>
);
