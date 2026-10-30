import { Link } from "react-router";
import "../../styles/home_style/Home_championship_card.css";
import { getChampionshipStatus } from "../ChampionshipStatus.js";

function ChampionshipCard({ id, name, season, status }) {
    return (
        <Link
            to={`/championships/${id}`}
            className="championship_card"
        >
            <span className="championship_status">
                {getChampionshipStatus(status)}
            </span>

            <h3>{name}</h3>

            <p>{season}</p>
        </Link>
    );
}

export default ChampionshipCard;
