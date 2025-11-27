export function createIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'indicator';
    indicator.className = 'page-base page-indicator';
    document.body.appendChild(indicator);

    return indicator;
}
