import "../../styles/Championship_style/Championship_card.css"

function ChampionshipCard({ championship, onClick, isSelected }) {
    return (
        <article
            className={`championship_card ${isSelected ? "selected" : ""}`}
            onClick={onClick}
        >
            <div className="championship_card_header">
                <h2>{championship.name}</h2>

                <span className={`championship_status ${championship.status}`}>
                    {championship.status === "planned"
                        ? "Tervezett"
                        : championship.status === "ongoing"
                        ? "Aktív"
                        : "Lezárult"}
                </span>
            </div>

            <p>
                {championship.start_date.slice(0, 4)}/
                {championship.end_date.slice(2, 4)}
            </p>
        </article>
    );
}

export default ChampionshipCard;