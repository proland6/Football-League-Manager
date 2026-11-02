import { apiRequest } from "./Api";

// Egy adott csapat lekérése
export function getTeamById(teamId) {
    return apiRequest(`/teams/${teamId}/`);
}

// Egy adott felhasználó lekérése
export function getUserById(userId) {
    return apiRequest(`/users/${userId}/`);
}

// Az összes bajnokság lekérése
export function getChampionships() {
    return apiRequest("/championships/");
}