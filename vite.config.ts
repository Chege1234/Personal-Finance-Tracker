import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// @ts-ignore
import { miaodaDevPlugin } from "miaoda-sc-plugin";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        svgr({
            svgrOptions: {
                icon: true, exportType: 'named', namedExport: 'ReactComponent',
            },
        }),
        VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            manifest: {
                name: 'Personal Finance Tracker',
                short_name: 'Finance',
                description: 'Track your daily spending with rolling budget allowance and AI-powered insights',
                theme_color: '#2D4356',
                background_color: '#ffffff',
                display: 'standalone',
                start_url: '/',
                scope: '/',
                icons: [
                    {
                        src: 'icon-192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'icon-512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'icon-192.svg',
                        sizes: '192x192',
                        type: 'image/svg+xml',
                        purpose: 'any'
                    },
                    {
                        src: 'icon-512.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml',
                        purpose: 'maskable'
                    }
                ]
            }
        }),
        miaodaDevPlugin()
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});