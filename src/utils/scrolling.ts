export const hasScrollbar = () => {
	return document.body.scrollHeight > window.innerHeight;
};

export const getScrollbarWidth = () => {
	const scrollDiv = document.createElement('div');
	scrollDiv.style.width = '100px';
	scrollDiv.style.height = '100px';
	scrollDiv.style.overflow = 'scroll';
	scrollDiv.style.position = 'absolute';
	scrollDiv.style.top = '-9999px';
	document.body.appendChild(scrollDiv);
	const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
	document.body.removeChild(scrollDiv);
	return scrollbarWidth;
};

export const lockScroll = () => {
	document.body.style.overflow = 'hidden';
	document.body.style.touchAction = 'none';
	const scrollbarWidth = getScrollbarWidth();

	if (hasScrollbar()) {
		document.body.style.paddingRight = `${scrollbarWidth}px`;
		const stickyStatistic = document.getElementById('sticky-statistic');
		if (stickyStatistic) {
			stickyStatistic.style.left = `calc(50% - ${scrollbarWidth / 2}px)`;
		}
	}
};

export const unlockScroll = () => {
	document.body.style.overflow = '';
	document.body.style.touchAction = '';
	document.body.style.paddingRight = '';
	const stickyStatistic = document.getElementById('sticky-statistic');
	if (stickyStatistic) {
		stickyStatistic.style.left = '50%';
	}
};
