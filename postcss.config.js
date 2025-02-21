export default {
	tailwindcss: {},
	autoprefixer: {},
	...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
};
