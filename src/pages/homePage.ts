import { createInfiniteScroll } from '@/utils/createInfiniteScroll'

export function homePage() {
    createInfiniteScroll('.container.index-container:not(.index-popular)')
}
