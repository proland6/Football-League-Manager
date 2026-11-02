
import { useParams } from "react-router";
import { useEffect, useState } from "react";

import { getPlayerById } from "../services/PlayersService";
import PlayerDetails from "../components/player_components/Player_details";
import { getTeamById } from "../services/TeamsService";

function Player() {
    const { playerId } = useParams();

    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState(null);

    useEffect(() => {
        async function fetchPlayer() {
            try {
                const playerData = await getPlayerById(playerId);
                setPlayer(playerData);
                if (playerData.team) {
                    const teamData = await getTeamById(playerData.team);
                    setTeam(teamData);
                }
            } catch (error) {
                console.error("Hiba a játékos adatainak lekérésekor:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchPlayer();
    }, [playerId]);

    if (loading) {
        return <p>Játékos adatainak betöltése...</p>;
    }

    if (!player) {
        return <p>Nem található ilyen játékos.</p>;
    }

    return (
        <div className="player_page">
            <PlayerDetails player={player} team={team}/>
        </div>
    );
}

export default Player;
