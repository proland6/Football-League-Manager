import { apiRequest } from "./Api";

export function getPlayersByTeam(teamId) {
    return apiRequest(`/players/?team=${teamId}`);
}

export function getPlayerById(playerId) {
    return apiRequest(`/players/${playerId}/`);
}