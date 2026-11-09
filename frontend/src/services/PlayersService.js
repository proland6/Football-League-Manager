import { apiRequest } from "./Api";

export async function getPlayersByTeam(teamId) {
    
    const players = await apiRequest(`/players/`); 
    
    return players.filter(player => player.team === Number(teamId) || player.team_id === Number(teamId));
}

export function getPlayerById(playerId) {
    return apiRequest(`/players/${playerId}/`);
}