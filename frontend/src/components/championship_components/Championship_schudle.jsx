
import { useState, useEffect } from "react";
import "../../styles/Championship_style/Championship_schudle.css"

function ChampionshipSchedule({ championshipId }) {
    const [teams, setTeams] = useState([]);
    const [matches, setMatches] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!championshipId) return;

        setLoading(true);
        setSelectedTeam(null);

        Promise.all([
            fetch("http://127.0.0.1:8000/api/teams/"),
            fetch("http://127.0.0.1:8000/api/matches/")
        ])
            .then(async ([teamsResponse, matchesResponse]) => {
                if (!teamsResponse.ok || !matchesResponse.ok) {
                    throw new Error("Nem sikerült lekérni az adatokat.");
                }

                const teamsData = await teamsResponse.json();
                const matchesData = await matchesResponse.json();

                const championshipTeams = teamsData.filter(team =>
                    team.championships.includes(championshipId)
                );

                setTeams(championshipTeams);

                const championshipMatches = matchesData.filter(match =>
                    match.championship === championshipId
                );

                setMatches(championshipMatches);

                if (championshipTeams.length > 0) {
                    setSelectedTeam(championshipTeams[0].id);
                }
            })
            .catch(error => {
                console.error("Hiba a sorsolás lekérésekor:", error);
                setTeams([]);
                setMatches([]);
            })
            .finally(() => setLoading(false));

    }, [championshipId]);

    const selectedTeamMatches = matches
        .filter(match =>
            match.home_team === selectedTeam ||
            match.away_team === selectedTeam
        )
        .sort((a, b) =>
            new Date(a.date_time) - new Date(b.date_time)
        );

    if (loading) {
        return <p>Sorsolás betöltése...</p>;
    }

    return (
        <section className="championship_schedule">
            <h2>Csapatok sorsolása</h2>

            {teams.length === 0 ? (
                <p>Ebben a bajnokságban még nincsenek csapatok.</p>
            ) : (
                <>
                    <div className="schedule_team_selector">
                        {teams.map(team => (
                            <button
                                key={team.id}
                                className={
                                    selectedTeam === team.id
                                        ? "selected"
                                        : ""
                                }
                                onClick={() => setSelectedTeam(team.id)}
                            >
                                {team.name}
                            </button>
                        ))}
                    </div>

                    <div className="schedule_matches">
                        {selectedTeamMatches.length === 0 ? (
                            <p>Ennek a csapatnak még nincsenek mérkőzései.</p>
                        ) : (
                            selectedTeamMatches.map(match => {
                                const isHome =
                                    match.home_team === selectedTeam;

                                return (
                                    <article
                                        className="schedule_match"
                                        key={match.id}
                                    >
                                        <div className="schedule_match_header">
                                            <span>
                                                {new Date(match.date_time).toLocaleString("hu-HU")}
                                            </span>

                                            <span className={
                                                isHome ? "home_match" : "away_match"
                                            }>
                                                {isHome ? "Hazai" : "Vendég"}
                                            </span>
                                        </div>

                                        <div className="schedule_match_teams">
                                            <strong>
                                                {teams.find(team =>
                                                    team.id === match.home_team
                                                )?.name}
                                            </strong>

                                            <span className="schedule_match_score">
                                                {match.status === "finished"
                                                    ? `${match.home_score} - ${match.away_score}`
                                                    : "VS"}
                                            </span>

                                            <strong>
                                                {teams.find(team =>
                                                    team.id === match.away_team
                                                )?.name}
                                            </strong>
                                        </div>
                                    </article>
                                );
                            })
                        )}
                    </div>
                </>
            )}
        </section>
    );
}

export default ChampionshipSchedule;
