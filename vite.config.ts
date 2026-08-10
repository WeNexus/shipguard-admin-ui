import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  // Served behind the /admin ingress rule on DigitalOcean, which strips the
  // prefix. Without this, index.html requests /assets/* and those get routed
  // to the frontend component instead of this one.
  base: "/admin/",
  plugins: [react(), tailwindcss()],
});
