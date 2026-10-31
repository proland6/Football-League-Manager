
import { useState, useEffect } from "react";
import "../../styles/Championship_style/Championship_table.css"

function ChampionshipTable({ championshipId }) {
    const [table, setTable] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!championshipId) return;

        setLoading(true);

        fetch(`http://127.0.0.1:8000/api/championships/${championshipId}/table/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Nem sikerült lekérni a tabellát.");
                }

                return response.json();
            })
            .then(data => setTable(data))
            .catch(error => {
                console.error("Hiba a tabella lekérésekor:", error);
                setTable([]);
            })
            .finally(() => setLoading(false));

    }, [championshipId]);

    if (loading) {
        return <p>Tabella betöltése...</p>;
    }

    return (
        <section className="championship_table">
            <h2>Tabella</h2>

            {table.length === 0 ? (
                <p>Még nincsenek csapatok ebben a bajnokságban.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>H.</th>
                            <th>Csapat</th>
                            <th>M.</th>
                            <th>GY.</th>
                            <th>D.</th>
                            <th>V.</th>
                            <th>LG.</th>
                            <th>KG.</th>
                            <th>GK.</th>
                            <th>P.</th>
                        </tr>
                    </thead>

                    <tbody>
                        {table.map((team, index) => (
                            <tr key={team.team_id}>
                                <td>{index + 1}.</td>
                                <td>{team.team_name}</td>
                                <td>{team.played}</td>
                                <td>{team.wins}</td>
                                <td>{team.draws}</td>
                                <td>{team.losses}</td>
                                <td>{team.goals_for}</td>
                                <td>{team.goals_against}</td>
                                <td>{team.goal_difference}</td>
                                <td>{team.points}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
}

export default ChampionshipTable;
