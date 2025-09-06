import './tailwind.css'
import { homePage } from '@/pages/homePage'
import { comicDetailPage } from '@/pages/comicDetail'
import { favoritesPage } from '@/pages/favoritesPage'
import { singlePage } from './pages/singlePage'

const pathname = window.location.pathname
const searchPage = ['/search/', '/parody/', '/tag/', '/artist/', '/group/', '/language/', '/category/', '/character/']

if (pathname === '/' || searchPage.some((path) => pathname.includes(path))) {
    // 首页
    homePage()
} else if (pathname.includes('/g/')) {
    // 漫画详情页，需要添加按钮和滚动预览
    const url = new URL(window.location.href)
    if (url.searchParams.get('single') === 'true') {
        singlePage()
    } else {
        comicDetailPage()
    }
} else if (pathname.includes('/favorites/')) {
    // 收藏夹页面
    favoritesPage()
}
