import "../../styles/Team_style/Team_details.css"

function TeamDetails({ team, leader, championships }) {
    return (
        <div className="team_details">
            <h1>{team.name}</h1>

            <div className="team_details_info">
                <p>
                    <strong>Csapatvezető:</strong>{" "}
                    {leader
                        ? `${leader.first_name} ${leader.last_name}`
                        : "Nincs megadva"}
                </p>

                <p>
                    <strong>Bajnokság:</strong>{" "}
                    {championships.length > 0
                        ? championships.map(championship => championship.name).join(", ")
                        : "Nincs bajnokság"}
                </p>
            </div>
        </div>
    );
}

export default TeamDetails;
