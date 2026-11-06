
import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Referee_matches.css";

const API_URL = "http://127.0.0.1:8000/api";

function RefereeMatches() {

    const [matches, setMatches] = useState([]);
    const [scores, setScores] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState({});
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const token = localStorage.getItem("access");

    // Mérkőzések lekérése
    useEffect(() => {

        const fetchMatches = async () => {

            if (!token) {
                window.location.href = "/login/";
                return;
            }

            try {

                const response = await axios.get(
                    `${API_URL}/referee/matches/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setMatches(response.data);

                const initialScores = {};

                response.data.forEach((match) => {
                    initialScores[match.id] = {
                        home_score: match.home_score ?? "",
                        away_score: match.away_score ?? ""
                    };
                });

                setScores(initialScores);

            } catch (err) {

                if (err.response?.status === 401) {
                    localStorage.removeItem("access");
                    localStorage.removeItem("refresh");
                    window.location.href = "/login/";
                } else {
                    setError("Nem sikerült betölteni a mérkőzéseket.");
                }

            } finally {
                setLoading(false);
            }
        };

        fetchMatches();

    }, [token]);

    // Eredménymezők módosítása
    const handleScoreChange = (matchId, field, value) => {

        setScores((prev) => ({
            ...prev,
            [matchId]: {
                ...prev[matchId],
                [field]: value
            }
        }));

    };

    // Eredmény mentése
    const handleSave = async (matchId) => {

        const score = scores[matchId];

        setError("");
        setSuccess("");

        if (
            score.home_score === "" ||
            score.away_score === "" ||
            !Number.isInteger(Number(score.home_score)) ||
            !Number.isInteger(Number(score.away_score)) ||
            Number(score.home_score) < 0 ||
            Number(score.away_score) < 0
        ) {
            setError("Kérlek, adj meg két érvényes, nemnegatív gólszámot!");
            return;
        }

        setSaving((prev) => ({
            ...prev,
            [matchId]: true
        }));

        try {

            await axios.patch(
                `${API_URL}/matches/${matchId}/`,
                {
                    home_score: Number(score.home_score),
                    away_score: Number(score.away_score),
                    status: "finished"
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // A befejezett mérkőzés eltávolítása
            setMatches((prev) =>
                prev.filter((match) => match.id !== matchId)
            );

            setSuccess("A mérkőzés eredménye sikeresen mentve!");

        } catch (err) {

            if (err.response?.status === 403) {
                setError("Nincs jogosultságod a mérkőzés módosításához.");
            } else {
                setError(
                    err.response?.data?.detail ||
                    "Nem sikerült elmenteni az eredményt."
                );
            }

        } finally {

            setSaving((prev) => ({
                ...prev,
                [matchId]: false
            }));

        }
    };

    // Dátum formázása
    const formatDate = (dateTime) => {

        return new Date(dateTime).toLocaleString("hu-HU", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

    };

    if (loading) {
        return (
            <div className="referee-loading">
                Mérkőzések betöltése...
            </div>
        );
    }

    return (
        <div className="referee-page">

            <div className="referee-header">
                <div>
                    <span className="referee-subtitle">
                        JÁTÉKVEZETŐI FELÜLET
                    </span>

                    <h1>Mérkőzéseim</h1>

                    <p>
                        Itt tekintheted meg a hozzád rendelt
                        mérkőzéseket és rögzítheted az eredményeket.
                    </p>
                </div>

                <div className="referee-match-count">
                    <span>{matches.length}</span>
                    <small>Hátralévő mérkőzés</small>
                </div>
            </div>

            {error && (
                <div className="referee-message referee-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="referee-message referee-success">
                    {success}
                </div>
            )}

            {matches.length === 0 ? (

                <div className="referee-empty">
                    <h2>Nincs rögzítendő mérkőzésed</h2>

                    <p>
                        Jelenleg nincs hozzád rendelt tervezett mérkőzés.
                    </p>
                </div>

            ) : (

                <div className="referee-match-list">

                    {matches.map((match) => (

                        <div className="referee-match-card" key={match.id}>

                            <div className="referee-match-top">

                                <span className="referee-championship">
                                    {match.championship_name}
                                </span>

                                <span className="referee-status">
                                    Tervezett
                                </span>

                            </div>

                            <div className="referee-match-date">
                                {formatDate(match.date_time)}
                            </div>

                            <div className="referee-teams">

                                <div className="referee-team">
                                    <h2>{match.home_team_name}</h2>
                                    <span>Hazai csapat</span>
                                </div>

                                <div className="referee-vs">
                                    VS
                                </div>

                                <div className="referee-team">
                                    <h2>{match.away_team_name}</h2>
                                    <span>Vendég csapat</span>
                                </div>

                            </div>

                            <div className="referee-score-section">

                                <h3>Végeredmény rögzítése</h3>

                                <div className="referee-score-inputs">

                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={scores[match.id]?.home_score ?? ""}
                                        onChange={(e) =>
                                            handleScoreChange(
                                                match.id,
                                                "home_score",
                                                e.target.value
                                            )
                                        }
                                        aria-label="Hazai csapat góljai"
                                    />

                                    <span>:</span>

                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={scores[match.id]?.away_score ?? ""}
                                        onChange={(e) =>
                                            handleScoreChange(
                                                match.id,
                                                "away_score",
                                                e.target.value
                                            )
                                        }
                                        aria-label="Vendég csapat góljai"
                                    />

                                </div>

                                <button
                                    className="referee-save-button"
                                    onClick={() => handleSave(match.id)}
                                    disabled={saving[match.id]}
                                >
                                    {saving[match.id]
                                        ? "Mentés..."
                                        : "Eredmény mentése"}
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default RefereeMatches;
