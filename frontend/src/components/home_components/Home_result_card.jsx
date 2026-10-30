import "../../styles/Home_style/Home_result_card.css"

function ResultCard({championship, home_team, away_team, home_score, away_score, date }){
    return(
        <div className="match_card">
            <div className="match_info">
                <span>{championship}</span>
                <span>{date}</span>
            </div>

            <div className="match_result">
                <span>{home_team}</span>

                <span className="match_score">
                    {home_score} - {away_score}
                </span>

                <span>{away_team}</span>

            </div>
        </div>
    );
}

export default ResultCard;