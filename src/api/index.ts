import { Enum } from 'enum-plus';
import type { INHentaiInfo } from './index.d';

/**
 * 根据本子id获取本子信息
 * @param galleryId 本子id
 */
export async function getNHentaiInfo(galleryId: string) {
    const response = await fetch(
        `https://nhentai.net/api/gallery/${galleryId}`,
    );
    const data: INHentaiInfo = await response.json();
    return data;
}

/**
 * 文件扩展名枚举
 */
export const Ext = Enum({
    webp: {
        value: 'w',
        ext: '.webp',
    },
    jpg: {
        value: 'j',
        ext: '.jpg',
    },
    png: {
        value: 'p',
        ext: '.png',
    },
} as const);
