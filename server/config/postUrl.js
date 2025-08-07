import axios from "axios";


export const getPosterUrl = async (title) => {
    try {
        const res = await axios.get('https://api.themoviedb.org/3/search/movie', {
            params: {
                api_key: process.env.TMDB_API_KEY,
                query: title,
            },
        });

        const result = res.data.results[0];
        if (result && result.poster_path) {
            return `https://image.tmdb.org/t/p/w500${result.poster_path}`;
        } else {
            console.warn(`No poster found for "${title}"`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching poster for "${title}":`, error.message);
        return null;
    }
};