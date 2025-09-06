import { reactive, effect } from '@/utils/reactive'
import { InfiniteScroll } from '@/utils/infiniteScroll'
import parseHTML from '@/utils/parseHTML'
import { createIndicator } from './createIndicator'

export function createInfiniteScroll(selector: string) {
    const store = reactive({
        page: 0,
        total: 0,
    })

    const indicator = createIndicator()
    effect(() => {
        indicator.textContent = `${store.page} / ${store.total}`
    })
    const totalElement = document.querySelector<HTMLAnchorElement>('.pagination > .last')
    if (totalElement) {
        const href = totalElement.href
        const url = new URL(href)
        const total = url.searchParams.get('page')
        if (total) {
            store.total = parseInt(total, 10)
        }
    } else {
        store.total = 1
    }

    const href = location.href
    const url = new URL(href)
    let page: number
    const currentPage = url.searchParams.get('page')
    if (currentPage) {
        page = parseInt(currentPage, 10)
        store.page = parseInt(currentPage, 10)
    } else {
        store.page = 1
        page = 1
    }
    const pagination = document.querySelector<HTMLElement>('section.pagination')
    if (pagination) {
        pagination.remove()
    }

    const content = document.getElementById('content')
    const loading = document.createElement('div')
    loading.id = 'loading'
    loading.innerHTML = `
        <div class="flex justify-center items-center py-5">
            <div class="size-10 border-nhentai border-gray-200 rounded-full animate-spin"></div>
            <span class="text-white ml-5 text-xl">加载中...</span>
        </div>
    `
    content?.appendChild(loading)

    effect(() => {
        if (store.page === store.total) {
            loading.innerHTML = `
                <div class="flex justify-center items-center pt-5 pb-10">
                    <span class="text-white text-xl"> - 已经没有了 - </span>
                </div>
            `
        }
    })

    const container = document.querySelector<HTMLDivElement>(selector)
    const observer = new IntersectionObserver(
        (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const map = new Map<string, number>()
                    const target = entry.target
                    const dataPage = target.getAttribute('data-page')
                    if (!dataPage) {
                        // window.log('未找到')
                        return
                    }

                    if (map.has(dataPage)) {
                        const count = map.get(dataPage)
                        if (count === undefined) {
                            // window.log('未找到该值')
                            return
                        }
                        map.set(dataPage, count + 1)
                    } else {
                        map.set(dataPage, 1)
                    }
                    const maxCount = Math.max(...map.values())
                    const maxPage = [...map.entries()].find(([_, value]) => value === maxCount)![0]
                    store.page = Number(maxPage)
                }
            })
        },
        { threshold: 0 }
    )

    if (container) {
        container.querySelectorAll<HTMLImageElement>('img.lazyload').forEach((img) => {
            img.setAttribute('data-page', page.toString())
            observer.observe(img)
        })
    }

    new InfiniteScroll({
        totalPages: store.total,
        currentPage: page,
        loadNextPage: async (page) => {
            const url = new URL(window.location.href)
            url.searchParams.set('page', String(page))

            const response = await fetch(url.href)
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

            const html = await response.text()
            const doc = parseHTML(html)
            const container = doc.querySelector<HTMLDivElement>(selector)
            const currentContainer = document.querySelector<HTMLDivElement>(selector)
            if (!container || !currentContainer) {
                throw new Error('找不到容器元素')
            }

            // 使用文档片段优化性能
            const fragment = document.createDocumentFragment()
            Array.from(container.children).forEach((child) => {
                fragment.appendChild(child)
            })

            fragment.querySelectorAll<HTMLImageElement>('img.lazyload').forEach((img) => {
                const dataSrc = img.getAttribute('data-src')
                observer.observe(img)

                if (dataSrc) {
                    img.src = dataSrc
                }
                img.setAttribute('data-page', page.toString())
            })
            currentContainer.appendChild(fragment)
        },
    })
}
