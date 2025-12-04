import { defineConfig } from 'vite';
import monkey  from 'vite-plugin-monkey';
import tailwindcss from '@tailwindcss/vite';
import { resolve, join } from 'node:path';
import { readFile } from 'node:fs/promises';
import pkg from './package.json' with { type: 'json' };

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
    let icon = 'https://nhentai.net/favicon.ico';
    if (mode === 'mobile') {
        const icoPath = join(__dirname, 'src/assets/favicon.ico');
        try {
            // 1. 直接读取文件二进制数据（不依赖格式验证）
            const buffer = await readFile(icoPath);
            // 2. 转换为 base64 字符串
            const base64Str = buffer.toString('base64');
            // 3. 拼接正确的 data URI（ico 对应的 MIME 是 image/x-icon）
            icon = `data:image/x-icon;base64,${base64Str}`;
            console.log('🎉 本地图标转换成功\n');
        } catch (err) {
            console.error('本地图标转换失败，使用默认图标:', err);
            // 失败时保持默认图标
        }
    }

    return {
        plugins: [
            tailwindcss(),
            monkey({
                entry: 'src/index.ts',
                userscript: {
                    name: 'nhentai 滚动浏览',
                    icon: icon,
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
            minify: true,
        },
    };
});
