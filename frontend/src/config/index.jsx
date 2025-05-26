const { default: axios } = require("axios");

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5050';
export const clientServer = axios.create({
    baseURL: BASE_URL,
})