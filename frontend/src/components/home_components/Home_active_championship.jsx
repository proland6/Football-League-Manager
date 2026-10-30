import { Link } from "react-router";
import { useState, useEffect } from "react";
import "../../styles/Home_style/Home_active_championship.css";
import ChampionshipCard from "./Home_championship_card";



function ActiveChampionships() {

    const [championships, setChampionships] = useState([]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/championships/")
            .then(response => response.json())
            .then(data => setChampionships(data))
            .catch(error => console.error("Hiba a bajnokságok lekérésekor:", error));
    }, []);

    return (
        <section className="active_championships">
            <div className="championships_header">
                <h2>Aktív bajnokságok</h2>

                <Link to="/championships">
                    Összes bajnokság →
                </Link>
            </div>

            <div className="championships_list">
                {championships
                    .filter((championship => championship.status == "ongoing"))
                    .map((championship) => (
                    <ChampionshipCard
                        key={championship.id}
                        id={championship.id}
                        name={championship.name}
                        season={`${championship.start_date.slice(0, 4)}/${championship.end_date.slice(2, 4)}`}
                        status={championship.status}
                    />
                ))}
            </div>

        </section>
    );
}

export default ActiveChampionships;
