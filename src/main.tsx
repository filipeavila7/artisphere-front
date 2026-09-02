import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { router } from "./App";
import { ToastProvider } from "./context/ToastContext";

import "./index.css";
import "./styles/variables.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
        <ToastProvider>
            <RouterProvider router={router} />
        </ToastProvider>
    </QueryClientProvider>
);
