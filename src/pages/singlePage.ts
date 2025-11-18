import { Ext, getNHentaiInfo } from '@/api';
import { createIndicator } from '@/utils/createIndicator';
import { reactive, effect } from '@/utils/reactive';

export async function singlePage() {
    const store = reactive({
        page: 0,
        total: 0,
    });

    const indicator = createIndicator();

    effect(() => {
        indicator.innerHTML = `
            <span>加载中... ${store.page} / ${store.total}</span>
        `;
        if (store.total === store.page && store.total !== 0) {
            indicator.remove();
        }
    });
    const url = new URL(window.location.href);
    const pathname = url.pathname;
    const [_space1, _prefix, galleryId, page, _space2] = pathname.split('/');
    const currentPage = Number(page);
    const content = document.getElementById('content');
    if (!content) return;
    const numPagesElement = document.querySelector<HTMLDivElement>(
        '.page-number.btn.btn-unstyled > .num-pages',
    );
    if (!numPagesElement) return;
    const total = Number(numPagesElement.textContent);
    store.total = total - currentPage + 1;
    content.remove();
    const container = document.createElement('div');
    container.className = 'w-fit mx-auto p-[20px] bg-[#1f1f1f]';
    document.body.appendChild(container);
    for (let i = currentPage; i <= total; i++) {
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'relative mb-[30px] text-center w-fit mx-auto';
        imgWrapper.id = `image-wrapper-${i}`;

        imgWrapper.innerHTML = `
        <div class="image-placeholder"></div>
        <span class="absolute top-[20px] right-[10px] bg-black/70 text-white px-[10px] py-[5px] rounded-[4px] text-[14px]">${i} / ${total}</span>
        `;
        container.appendChild(imgWrapper);
    }

    const { images, media_id } = await getNHentaiInfo(galleryId);
    const imageUrls: string[] = [];
    const requestPool: string[] = [];
    for (let i = currentPage; i <= total; i++) {
        const fileName = `${i}${Ext.raw(images.pages[i - 1].t).ext}`;
        const url = `https://i1.nhentai.net/galleries/${media_id}/${fileName}`;
        imageUrls.push(url);
        requestPool.push(url);
    }

    // 同时加载的图片数量
    const maxConcurrentRequests = 3;

    // 执行加载
    async function loadImages() {
        const inProgress: number[] = [];

        // 控制最大并发数量
        while (requestPool.length > 0 || inProgress.length > 0) {
            if (
                inProgress.length < maxConcurrentRequests &&
                requestPool.length > 0
            ) {
                const imageUrl = requestPool.shift(); // 按顺序从前面取出图片
                if (!imageUrl) return;
                const imageIndex = imageUrls.indexOf(imageUrl);

                const imagePromise = loadImage(imageUrl, imageIndex)
                    .then(({ page, img }) => {
                        const imgWrapper = document.getElementById(
                            `image-wrapper-${page}`,
                        );
                        if (!imgWrapper) return;
                        const placeholder =
                            imgWrapper.querySelector<HTMLDivElement>(
                                '.image-placeholder',
                            );
                        if (placeholder) {
                            placeholder.remove();
                        }
                        imgWrapper.appendChild(img);
                        store.page += 1;
                    })
                    .catch(({ index }) => {
                        // 加载失败，重新放回池中
                        console.log(`Image ${index} failed, retrying...`);
                        const host = new URL(imageUrls[index]).host;
                        const prefix = host.split('.')[0];
                        const currentServer = prefix.split('')[1];
                        requestPool.push(
                            imageUrls[index].replace(
                                `https://${prefix}`,
                                `https://i${(Number(currentServer) % 5) + 1}`,
                            ),
                        ); // 按顺序将失败的图片重新放回池中
                    })
                    .finally(() => {
                        // 加载完成，从进行中的任务中移除
                        const idx = inProgress.indexOf(imageIndex);
                        if (idx >= 0) inProgress.splice(idx, 1);
                    });

                // 将当前加载的任务加入进行中的任务列表
                inProgress.push(imageIndex);
                imagePromise;
            }

            await new Promise((resolve) => setTimeout(resolve, 100)); // 小延迟
        }
    }

    loadImages();
}

// 加载图片
function loadImage(
    imageUrl: string,
    index: number,
): Promise<{ page: number; img: HTMLImageElement }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imageUrl;
        img.className = 'nhentai-image';
        const url = new URL(imageUrl);
        const fileName = url.pathname.split('/').at(-1);
        const page = fileName?.split('.')[0];
        img.onload = () => resolve({ page: Number(page), img });
        img.onerror = () => reject({ index, error: 'Failed to load image' });
    });
}
