import { throttle } from 'lodash-es'

/**
 * 滚动加载器选项
 */
interface InfiniteScrollOptions {
    /** 加载下一页数据的函数，返回Promise */
    loadNextPage: (page: number) => Promise<unknown>
    /** 总页数 */
    totalPages: number
    /** 初始页码，默认为1 */
    currentPage?: number
}

/**
 * 无限滚动加载器类
 */
export class InfiniteScroll {
    private currentPage: number
    private totalPages: number
    private loadNextPage: (page: number) => Promise<unknown>
    private isLoading: boolean = false
    private scrollListener: () => void
    private throttleTime: number

    constructor(options: InfiniteScrollOptions) {
        this.currentPage = options.currentPage || 1
        this.totalPages = options.totalPages
        this.loadNextPage = options.loadNextPage
        this.throttleTime = 200

        // 使用lodash的throttle包装滚动事件处理函数，限制触发频率
        this.scrollListener = throttle(this.handleScroll.bind(this), this.throttleTime)
        window.addEventListener('scroll', this.scrollListener)
    }

    /**
     * 处理滚动事件
     */
    private handleScroll(): void {
        // 如果正在加载、已经是最后一页，则不触发加载
        if (this.isLoading || this.currentPage >= this.totalPages) {
            return
        }

        // 计算滚动进度
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
        const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
        const clientHeight = document.documentElement.clientHeight || window.innerHeight

        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight

        // 当滚动到80%及以上时，加载下一页
        if (scrollPercentage >= 0.8) {
            this.loadNext()
        }
    }

    /**
     * 加载下一页数据
     */
    private async loadNext(): Promise<void> {
        this.isLoading = true
        const nextPage = this.currentPage + 1

        try {
            await this.loadNextPage(nextPage)
            this.currentPage = nextPage
        } catch (error) {
            // 加载失败时重试
            await this.retryLoad(nextPage)
        } finally {
            this.isLoading = false
        }
    }

    /**
     * 重试加载指定页码
     */
    private async retryLoad(page: number): Promise<void> {
        // 延迟重试，避免过于频繁请求
        await new Promise((resolve) => setTimeout(resolve, 500))

        try {
            await this.loadNextPage(page)
            this.currentPage = page
        } catch (error) {
            // 继续重试，直到成功
            await this.retryLoad(page)
        }
    }
}
