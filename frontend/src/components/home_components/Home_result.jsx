import { useState, useEffect } from "react";
import "../../styles/Home_style/Home_result.css"
import ResultCard from "./Home_result_card";

function Result(){
    
    const [selectChampionship, setSelectedChampionship] = useState("all");
    const [matches, setMatches] = useState([]);
    const [championships, setChampionships] = useState([]);
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/matches/")
            .then(response => response.json())
            .then(data => setMatches(data))
            .catch(error =>
                console.error("Hiba a mérkőzések lekérésekor:", error)
            );

        fetch("http://127.0.0.1:8000/api/championships/")
            .then(response => response.json())
            .then(data => setChampionships(data))
            .catch(error =>
                console.error("Hiba a bajnokságok lekérésekor:", error)
            );

        fetch("http://127.0.0.1:8000/api/teams/")
            .then(response => response.json())
            .then(data => setTeams(data))
            .catch(error =>
                console.error("Hiba a csapatok lekérésekor:", error)
             );
    }, []);

    

    const getTeamName = (teamId) => {
        const team = teams.find(team => team.id === teamId);
        return team ? team.name : "Ismeretlen csapat";
    };

    const getChampionshipName = (championshipId) => {
        const championship = championships.find(
            championship => championship.id === championshipId
        );

        return championship ? championship.name : "Ismeretlen bajnokság";
    };

    return(
        <section className="home_result">
            <div className="result_header">
                <h2>Legutóbbi eredmények</h2>

                <select 
                    value={selectChampionship}
                    onChange={(event) => setSelectedChampionship(event.target.value)}
                    className="championship_filter"
                    aria-label="Bajnokság kiválasztása"
                >
                    <option value="all">Összes bajnokság</option>
                   {championships
                        .filter((championship) => championship.status === "ongoing")
                        .map((championship) => (
                            <option key={championship.id} value={championship.id}>
                                {championship.name}
                            </option>
                        ))}

                </select>
            </div>

            <div className="match_list">
                {matches
                    .filter((match) =>
                         match.status==="finished" &&
                         championships.some(
                            championship =>
                                championship.id === match.championship &&
                                championship.status === "ongoing"
                         ) &&
                         (
                            selectChampionship == "all" || match.championship==Number(selectChampionship)
                         ))
                    .sort((a, b) => new Date(b.date_time) - new Date(a.date_time))
                    .slice(0,5)
                    .map((match) =>
                        (
                            <ResultCard
                                key={match.id}
                                id={match.id}
                                championship={getChampionshipName(match.championship)}
                                home_team={getTeamName(match.home_team)}
                                away_team={getTeamName(match.away_team)}
                                home_score={match.home_score}
                                away_score={match.away_score}
                                date={match.date_time}

                            
                            />
                        
                    ))
                }
            </div>
        </section>
    );
}

export default Result;