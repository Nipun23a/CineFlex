// src/api/tmdb.js
const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/";

const tmdbFetch = async (path, params = {}) => {
    const url = new URL(`${TMDB_BASE}${path}`);
    url.searchParams.set("api_key", TMDB_KEY);
    url.searchParams.set("language", "en-US");
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });
    const res = await fetch(url);
    if (!res.ok) throw new Error(`TMDB ${path} failed: ${res.status}`);
    return res.json();
};

export const findTmdbMovieId = async (title, year) => {
    const data = await tmdbFetch("/search/movie", { query: title, include_adult: "false", year });
    if (!data.results?.length) return null;
    const filtered = year
        ? data.results.filter(r => (r.release_date || "").startsWith(String(year)))
        : data.results;
    return (filtered[0] || data.results[0])?.id ?? null;
};

export const getTmdbCast = async (tmdbMovieId, { limit = 18 } = {}) => {
    const data = await tmdbFetch(`/movie/${tmdbMovieId}/credits`);
    return (data.cast || []).slice(0, limit).map(p => ({
        id: p.id,
        name: p.name,
        character: p.character,
        imageUrl: p.profile_path ? `${IMG_BASE}w185${p.profile_path}` : null,
    }));
};

export const getTmdbReviews = async (tmdbMovieId, { page = 1 } = {}) => {
    const data = await tmdbFetch(`/movie/${tmdbMovieId}/reviews`, { page });
    return (data.results || []).map(r => ({
        id: r.id,
        author: r.author,
        rating: r.author_details?.rating ?? null,
        content: r.content,
        url: r.url,
        createdAt: r.created_at,
    }));
};
