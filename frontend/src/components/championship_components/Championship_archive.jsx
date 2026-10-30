import "../../styles/Championship_style/Championship_archive.css"

function ChampionshipArchive({ seasons, selectedSeason, onSeasonChange }) {

    return (
        <div className="championships_archive">
            <label htmlFor="season_select">Archívum</label>

            <select
                id="season_select"
                value={selectedSeason}
                onChange={(event) => onSeasonChange(event.target.value)}
            >
                <option value="current">Aktuális szezon</option>

                {seasons.map(season => (
                    <option key={season} value={season}>
                        {season}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default ChampionshipArchive;