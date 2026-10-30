import { useState, useEffect } from "react";
import "../styles/home_style/Home_championship_card.css";

function Championships() {
    const [championships, setChampionships] = useState([]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/championships/")
            .then(response => response.json())
            .then(data => setChampionships(data))
            .catch(error =>
                console.error("Hiba a bajnokságok lekérésekor:", error)
            );
    }, []);

    return (
        <main className="championships_page">
            <h1>Bajnokságok</h1>

            <div className="championships_list">
                {championships.map(championship => (
                    <article
                        className="championship_card"
                        key={championship.id}
                    >
                        <h2>{championship.name}</h2>

                        <p>
                            Szezon:{" "}
                            {championship.start_date.slice(0, 4)}/
                            {championship.end_date.slice(2, 4)}
                        </p>

                        <p>
                            Státusz:{" "}
                            {championship.status === "planned"
                                ? "Tervezett"
                                : championship.status === "ongoing"
                                ? "Aktív"
                                : championship.status === "finished"
                                ? "Lezárult"
                                : "Ismeretlen"}
                        </p>
                    </article>
                ))}
            </div>
        </main>
    );
}

export default Championships;
