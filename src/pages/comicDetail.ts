export function comicDetailPage() {
    const downloadBtn = document.querySelector<HTMLDivElement>('#download');
    if (!downloadBtn) return;

    const singleImageBtn = document.createElement('button');
    singleImageBtn.id = 'scroll-mode';
    singleImageBtn.className = 'btn btn-primary';
    singleImageBtn.innerHTML = `
        <i class="fa fa-scroll"></i>
        <span class="text">滚动浏览</span>
    `;

    singleImageBtn.addEventListener('click', () => {
        const currentUrl = new URL(window.location.href);
        const pathSegments = currentUrl.pathname.split('/');
        const newPath = `${pathSegments[1]}/${pathSegments[2]}/1/`;
        window.location.href = `${currentUrl.origin}/${newPath}?single=true`;
    });

    downloadBtn.parentNode?.insertBefore(
        singleImageBtn,
        downloadBtn.nextSibling,
    );
}
