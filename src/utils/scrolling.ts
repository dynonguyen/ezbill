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

	if (hasScrollbar()) {
		document.body.style.paddingRight = `${getScrollbarWidth()}px`;
	}
};

export const unlockScroll = () => {
	document.body.style.overflow = '';
	document.body.style.paddingRight = '';
};
