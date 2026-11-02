const API_BASE_URL = "http://127.0.0.1:8000/api";

export async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
        throw new Error(`API hiba: ${response.status}`);
    }

    return await response.json();
}