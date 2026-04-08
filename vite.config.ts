import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

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
                id: '/?source=pwa',
                name: 'Personal Finance Tracker',
                short_name: 'Finance',
                description: 'Track your daily spending with rolling budget allowance and AI-powered insights',
                theme_color: '#2D4356',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                start_url: '/',
                scope: '/',
                categories: ['finance', 'productivity'],
                icons: [
                    {
                        src: 'icon-192-v2.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: 'icon-512-v2.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ],
                screenshots: [
                    {
                        src: 'icon-512-v2.png',
                        sizes: '512x512',
                        type: 'image/png',
                        form_factor: 'wide',
                        label: 'Personal Finance Tracker dashboard'
                    },
                    {
                        src: 'icon-192-v2.png',
                        sizes: '192x192',
                        type: 'image/png',
                        form_factor: 'narrow',
                        label: 'Personal Finance Tracker'
                    }
                ]
            }
        }),
        miaodaDevPlugin(),
        visualizer({
            open: false,
            filename: 'stats.html',
            gzipSize: true,
            brotliSize: true,
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});