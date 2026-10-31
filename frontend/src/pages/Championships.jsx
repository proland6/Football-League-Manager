import { useState, useEffect } from "react";
import Archive from "../components/championship_components/Championship_archive";
import ChampionshipCard from "../components/championship_components/Championship_card";
import ChampionshipTable from "../components/championship_components/Championship_table";
import ChampionshipSchedule from "../components/championship_components/Championship_schudle";

function Championships() {
    const [championships, setChampionships] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState("current");
    const [selectedChampionship, setSelectedChampionship] = useState(null);

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

    useEffect(() => {
        if (displayedChampionships.length > 0) {
            setSelectedChampionship(displayedChampionships[0].id);
        } else {
            setSelectedChampionship(null);
        }
    }, [selectedSeason, championships]);



    
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
                        onClick={() => {
                            setSelectedChampionship(
                            selectedChampionship === championship.id
                            ? null
                            : championship.id
                            );
                        }}
                        isSelected={selectedChampionship === championship.id}
                    />
                ))}
            </div>

            {selectedChampionship && (
                <>
                    <ChampionshipTable championshipId={selectedChampionship} />

                    <ChampionshipSchedule championshipId={selectedChampionship}/>
                </>
            )}
        </main>
    );
}

export default Championships;