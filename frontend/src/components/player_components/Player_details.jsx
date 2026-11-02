import "../../styles/Player_style/Player_details.css"
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

function PlayerDetails({ player, team }) {
    const navigate = useNavigate();

    return (
        <div className="player_details">
            <div className="player_details_image">
                {player.image ? (
                    <img
                        src={player.image}
                        alt={`${player.first_name} ${player.last_name}`}
                    />
                ) : (
                    <div className="player_image_placeholder">
                        Nincs kép
                    </div>
                )}
            </div>

            <div className="player_details_info">
                <h1>{player.first_name} {player.last_name}</h1>

                <div className="player_info_item">
                    <strong>Születési dátum:</strong>
                    <span>{player.birth_date}</span>
                </div>

                <div className="player_info_item">
                    <strong>Életkor:</strong>
                    <span>{calculateAge(player.birth_date)} év</span>
                </div>

                <div className="player_info_item">
                    <strong>E-mail cím:</strong>
                    <span>{player.email}</span>
                </div>

                <div className="player_info_item">
                    <strong>Csapat:</strong>    
                    {team ? (
                        <span
                            className="player_team_link"
                            onClick={() => navigate(`/teams/${team.id}`)}
                        >
                            {team.name}
                        </span>
                    ) : (
                        <span>Nincs csapatba igazolva</span>
                    )}
                </div>


            </div>
        </div>
    );
}

export default PlayerDetails;
