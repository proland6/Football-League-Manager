import { useState, useEffect } from "react";
import Archive from "../components/championship_components/Championship_archive";
import ChampionshipCard from "../components/championship_components/Championship_card";

function Championships() {
    const [championships, setChampionships] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState("current");

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/championships/")
            .then(response => response.json())
            .then(data => setChampionships(data))
            .catch(error =>
                console.error("Hiba a bajnokságok lekérésekor:", error)
            );
    }, []);

    const seasons = [...new Set(
        championships
            .filter(championship => championship.status === "finished")
            .map(championship =>
                `${championship.start_date.slice(0, 4)}/${championship.end_date.slice(2, 4)}`
            )
    )].sort().reverse();

    const displayedChampionships = championships.filter(championship => {
        const season = `${championship.start_date.slice(0, 4)}/${championship.end_date.slice(2, 4)}`;

        if (selectedSeason === "current") {
            return championship.status === "ongoing";
        }

        return championship.status === "finished" &&
           season === selectedSeason;
    });

    console.log("Kiválasztott szezon:", selectedSeason);
    console.log("Összes bajnokság:", championships);
    console.log("Megjelenítendő bajnokságok:", displayedChampionships);
    return (
        <main className="championships_page">
            <h1>Bajnokságok</h1>

            <Archive
                seasons={seasons}
                selectedSeason={selectedSeason}
                onSeasonChange={setSelectedSeason}
            />

            <div className="championships_list">
                {displayedChampionships.map(championship => (
                    <ChampionshipCard
                        key={championship.id}
                        championship={championship}
                    />
                ))}
            </div>
        </main>
    );
}

export default Championships;