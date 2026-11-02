
import { useParams } from "react-router";
import { useEffect, useState } from "react";

import { getTeamById, getUserById, getChampionships } from "../services/TeamsService";
import TeamDetails from "../components/team_components/Team_details";

import { getPlayersByTeam } from "../services/PlayersService";
import TeamPlayers from "../components/team_components/Team_players";

function Team() {
    const { teamId } = useParams();

    const [team, setTeam] = useState(null);
    const [leader, setLeader] = useState(null);
    const [championships, setChampionships] = useState([]);
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        async function fetchTeamData() {
            try {
                const teamData = await getTeamById(teamId);
                setTeam(teamData);

                const playersData = await getPlayersByTeam(teamId);
                setPlayers(playersData);

                if (teamData.leader) {
                    const leaderData = await getUserById(teamData.leader);
                    setLeader(leaderData);
                }

                const championshipData = await getChampionships();

                const teamChampionships = championshipData.filter(
                    championship => teamData.championships.includes(championship.id)
                );

                setChampionships(teamChampionships);
            } catch (error) {
                console.error("Hiba a csapat adatainak lekérésekor:", error);
            }
        }

        fetchTeamData();
    }, [teamId]);

    if (!team) {
        return <p>Csapat adatainak betöltése...</p>;
    }

    return (
        <div className="team_page">
            <TeamDetails
                team={team}
                leader={leader}
                championships={championships}
            />

            <TeamPlayers players={players} />
        </div>
    );
}

export default Team;
