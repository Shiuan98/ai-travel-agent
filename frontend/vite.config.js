import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [vue(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    allowedHosts: [
      'sprayful-leland-unjudgelike.ngrok-free.dev' // 👈 Add your ngrok host here
    ]
  }
});