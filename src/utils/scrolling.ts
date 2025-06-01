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
	const body = document.body;
	if (body.classList.contains('is-fixed')) return;

	const scrollTop = window.scrollY;
	body.classList.add('is-fixed');
	body.style.top = `-${scrollTop}px`;
	const scrollbarWidth = getScrollbarWidth();

	if (hasScrollbar()) {
		body.style.paddingRight = `${scrollbarWidth}px`;
		const stickyStatistic = document.getElementById('sticky-statistic');
		if (stickyStatistic) {
			stickyStatistic.style.left = `calc(50% - ${scrollbarWidth / 2}px)`;
		}
	}
};

export const unlockScroll = () => {
	const body = document.body;

	if (!body.classList.contains('is-fixed')) return;

	const scrollTop = -parseInt(body.style.top || '0', 10) || 0;
	body.classList.remove('is-fixed');
	body.style.top = '';
	body.style.paddingRight = '';

	const stickyStatistic = document.getElementById('sticky-statistic');
	if (stickyStatistic) {
		stickyStatistic.style.left = '50%';
	}

	window.scrollTo(0, scrollTop);
};
