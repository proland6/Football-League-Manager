import "../../styles/Team_style/Team_players.css"
import { useNavigate } from "react-router";

function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();

    if (
        today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() &&
            today.getDate() < birth.getDate())
    ) {
        age--;
    }

    return age;
}

function TeamPlayers({ players }) {
    const navigate = useNavigate();

    return (
        <div className="team_players">
            <h2>Játékoskeret</h2>

            <div className="players_table_container">
                <table className="players_table">
                    <thead>
                        <tr>
                            <th>Fotó</th>
                            <th>Játékos neve</th>
                            <th>Kor</th>
                        </tr>
                    </thead>

                    <tbody>
                        {players.map(player => (
                            <tr 
                                key={player.id}
                                className="player_name"
                                onClick={() => navigate(`/players/${player.id}`)}
                            
                            >
                                <td>
                                    {player.image ? (
                                        <img
                                            src={player.image}
                                            alt={`${player.first_name} ${player.last_name}`}
                                            className="player_image"
                                        />
                                    ) : (
                                        <div className="player_no_image">
                                            Nincs kép
                                        </div>
                                    )}
                                </td>

                                <td>
                                    {player.first_name} {player.last_name}
                                </td>

                                <td>
                                    {calculateAge(player.birth_date)} év
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {players.length === 0 && (
                    <p className="no_players">
                        Ehhez a csapathoz még nincsenek játékosok.
                    </p>
                )}
            </div>
        </div>
    );
}

export default TeamPlayers;
