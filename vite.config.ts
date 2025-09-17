import { defineConfig } from 'vite';
import monkey, { cdn } from 'vite-plugin-monkey';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';
import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        tailwindcss(),
        monkey({
            entry: 'src/index.ts',
            userscript: {
                name: 'nhentai 滚动浏览',
                icon: 'https://nhentai.net/favicon.ico',
                version: pkg.version,
                description:
                    '一个提升nhentai的脚本，包括无限滚动加载，滚动浏览图片',
                namespace: 'npm/vite-plugin-monkey',
                match: ['https://nhentai.net/*'],
                'run-at': 'document-end',
                license: 'MIT',
            },
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    build: {
        minify: 'terser',
    },
});
