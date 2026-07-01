import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";

// Direct CSS import — Vite injects it into index.html <head> at build time,
// so the stylesheet starts loading in parallel with JS (no FOUC).
import "./style.css";

const router = getRouter();

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

// Hide the preloader once React has mounted
requestAnimationFrame(() => {
  const preloader = document.getElementById("preloader");
  if (preloader) preloader.classList.add("hide");
});
