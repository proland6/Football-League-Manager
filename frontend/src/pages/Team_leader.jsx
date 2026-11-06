
import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Team_leader.css";

const API_URL = "http://127.0.0.1:8000/api";

function TeamLeader() {

    const [team, setTeam] = useState(null);
    const [players, setPlayers] = useState([]);
    const [matches, setMatches] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState(null);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        birth_date: "",
        email: "",
        image: null
    });

    const token = localStorage.getItem("access");

    // Bejelentkezett felhasználó ID-jának lekérése a JWT tokenből
    const getUserId = () => {
        try {
            const payload = JSON.parse(
                atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
            );

            return payload.user_id;
        } catch {
            return null;
        }
    };

    // Adatok betöltése
    const fetchData = async () => {

        if (!token) {
            window.location.href = "/login/";
            return;
        }

        try {

            const headers = {
                Authorization: `Bearer ${token}`
            };

            const userId = getUserId();

            if (!userId) {
                setError("Nem sikerült azonosítani a felhasználót.");
                return;
            }

            const [teamsResponse, playersResponse, matchesResponse] =
                await Promise.all([
                    axios.get(`${API_URL}/teams/`, { headers }),
                    axios.get(`${API_URL}/players/`, { headers }),
                    axios.get(`${API_URL}/matches/`, { headers })
                ]);

            // Saját csapat megkeresése
            const ownTeam = teamsResponse.data.find(
                (item) => Number(item.leader) === Number(userId)
            );

            if (!ownTeam) {
                setError("Nem található hozzád rendelt csapat.");
                return;
            }

            setTeam(ownTeam);

            // Saját játékosok
            setPlayers(playersResponse.data);

            // Saját csapat mérkőzései
            const ownMatches = matchesResponse.data.filter(
                (match) =>
                    match.home_team === ownTeam.id ||
                    match.away_team === ownTeam.id
            );

            setMatches(
                ownMatches.sort(
                    (a, b) =>
                        new Date(b.date_time) - new Date(a.date_time)
                )
            );

        } catch (err) {

            if (err.response?.status === 401) {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                window.location.href = "/login/";
            } else {
                setError("Nem sikerült betölteni az adatokat.");
            }

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Űrlapmezők kezelése
    const handleChange = (e) => {

        const { name, value, files } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value
        }));

    };

    // Új játékos űrlap
    const handleNewPlayer = () => {

        setEditingPlayer(null);

        setFormData({
            first_name: "",
            last_name: "",
            birth_date: "",
            email: "",
            image: null
        });

        setShowForm(true);
        setError("");
        setSuccess("");

    };

    // Játékos szerkesztése
    const handleEditPlayer = (player) => {

        setEditingPlayer(player);

        setFormData({
            first_name: player.first_name,
            last_name: player.last_name,
            birth_date: player.birth_date,
            email: player.email,
            image: null
        });

        setShowForm(true);
        setError("");
        setSuccess("");

    };

    // Játékos mentése
    const handleSavePlayer = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.email.trim()) {
            setError("Az email-cím megadása kötelező.");
            return;
        }

        setSaving(true);

        try {

            const data = new FormData();

            if (editingPlayer) {

                data.append("email", formData.email);

                if (formData.image) {
                    data.append("image", formData.image);
                }

                await axios.patch(
                    `${API_URL}/players/${editingPlayer.id}/`,
                    data,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setSuccess("A játékos adatai sikeresen módosítva!");

            } else {

                if (
                    !formData.first_name.trim() ||
                    !formData.last_name.trim() ||
                    !formData.birth_date
                ) {
                    setError("Kérlek, töltsd ki az összes kötelező mezőt!");
                    setSaving(false);
                    return;
                }

                data.append("first_name", formData.first_name);
                data.append("last_name", formData.last_name);
                data.append("birth_date", formData.birth_date);
                data.append("email", formData.email);

                if (formData.image) {
                    data.append("image", formData.image);
                }

                await axios.post(
                    `${API_URL}/players/`,
                    data,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setSuccess("Az új játékos sikeresen hozzáadva!");

            }

            setShowForm(false);
            setEditingPlayer(null);

            await fetchData();

        } catch (err) {

            if (err.response?.status === 403) {
                setError("Nincs jogosultságod ehhez a művelethez.");
            } else {
                setError(
                    err.response?.data?.detail ||
                    "Nem sikerült elmenteni a játékost."
                );
            }

        } finally {
            setSaving(false);
        }
    };

    // Játékos törlése
    const handleDeletePlayer = async (playerId) => {

        if (!window.confirm("Biztosan törölni szeretnéd ezt a játékost?")) {
            return;
        }

        setError("");
        setSuccess("");

        try {

            await axios.delete(
                `${API_URL}/players/${playerId}/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setPlayers((prev) =>
                prev.filter((player) => player.id !== playerId)
            );

            setSuccess("A játékos sikeresen törölve!");

        } catch (err) {

            if (err.response?.status === 403) {
                setError("Nincs jogosultságod a játékos törléséhez.");
            } else {
                setError("Nem sikerült törölni a játékost.");
            }

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

    // Mérkőzés státusz
    const getStatus = (status) => {

        const statuses = {
            scheduled: "Tervezett",
            ongoing: "Aktív",
            finished: "Befejezett",
            cancelled: "Törölt"
        };

        return statuses[status] || status;

    };

    if (loading) {
        return (
            <div className="team-leader-loading">
                Adatok betöltése...
            </div>
        );
    }

    return (

        <div className="team-leader-page">

            {/* FEJLÉC */}
            <div className="team-leader-header">

                <div>
                    <span className="team-leader-subtitle">
                        CSAPATVEZETŐI FELÜLET
                    </span>

                    <h1>{team?.name || "Saját csapat"}</h1>

                    <p>
                        Itt kezelheted csapatod játékosait és
                        megtekintheted a mérkőzéseket.
                    </p>
                </div>

                <div className="team-leader-stats">

                    <div className="team-stat">
                        <span>{players.length}</span>
                        <small>Játékos</small>
                    </div>

                    <div className="team-stat">
                        <span>{matches.length}</span>
                        <small>Mérkőzés</small>
                    </div>

                </div>

            </div>

            {/* ÜZENETEK */}
            {error && (
                <div className="team-leader-message team-leader-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="team-leader-message team-leader-success">
                    {success}
                </div>
            )}

            {/* JÁTÉKOSOK */}
            <section className="team-leader-section">

                <div className="team-section-header">

                    <div>
                        <h2>Játékosok</h2>
                        <p>A csapatod játékosainak kezelése.</p>
                    </div>

                    <button
                        className="team-add-button"
                        onClick={handleNewPlayer}
                    >
                        + Új játékos
                    </button>

                </div>

                {players.length === 0 ? (

                    <div className="team-leader-empty">
                        <h3>Még nincsenek játékosok</h3>
                        <p>Adj hozzá játékosokat a csapatodhoz!</p>
                    </div>

                ) : (

                    <div className="team-player-list">

                        {players.map((player) => (

                            <div
                                className="team-player-card"
                                key={player.id}
                            >

                                <div className="team-player-info">

                                    {player.image ? (
                                        <img
                                            className="team-player-image"
                                            src={player.image}
                                            alt={`${player.first_name} ${player.last_name}`}
                                        />
                                    ) : (
                                        <div className="team-player-placeholder">
                                            {player.first_name?.[0]}
                                            {player.last_name?.[0]}
                                        </div>
                                    )}

                                    <div>
                                        <h3>
                                            {player.last_name} {player.first_name}
                                        </h3>

                                        <p>{player.email}</p>

                                        <small>
                                            Születési dátum: {player.birth_date}
                                        </small>
                                    </div>

                                </div>

                                <div className="team-player-actions">

                                    <button
                                        className="team-edit-button"
                                        onClick={() => handleEditPlayer(player)}
                                    >
                                        Szerkesztés
                                    </button>

                                    <button
                                        className="team-delete-button"
                                        onClick={() => handleDeletePlayer(player.id)}
                                    >
                                        Törlés
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </section>

            {/* JÁTÉKOS ŰRLAP */}
            {showForm && (

                <div className="team-modal-overlay">

                    <form
                        className="team-player-form"
                        onSubmit={handleSavePlayer}
                    >

                        <h2>
                            {editingPlayer
                                ? "Játékos módosítása"
                                : "Új játékos hozzáadása"}
                        </h2>

                        {!editingPlayer && (

                            <>
                                <label>Vezetéknév</label>

                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                />

                                <label>Keresztnév</label>

                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                />

                                <label>Születési dátum</label>

                                <input
                                    type="date"
                                    name="birth_date"
                                    value={formData.birth_date}
                                    onChange={handleChange}
                                    required
                                />

                            </>

                        )}

                        <label>Email-cím</label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <label>Profilkép (JPG vagy PNG, maximum 5 MB)</label>

                        <input
                            type="file"
                            name="image"
                            accept="image/jpeg,image/png"
                            onChange={handleChange}
                        />

                        {editingPlayer && (
                            <p className="team-form-note">
                                A játékos neve és születési dátuma nem módosítható.
                            </p>
                        )}

                        <div className="team-form-actions">

                            <button
                                type="button"
                                className="team-cancel-button"
                                onClick={() => setShowForm(false)}
                            >
                                Mégse
                            </button>

                            <button
                                type="submit"
                                className="team-submit-button"
                                disabled={saving}
                            >
                                {saving ? "Mentés..." : "Mentés"}
                            </button>

                        </div>

                    </form>

                </div>

            )}

            {/* MÉRKŐZÉSEK */}
            <section className="team-leader-section">

                <div className="team-section-header">
                    <div>
                        <h2>Mérkőzések</h2>
                        <p>A csapatod összes mérkőzése.</p>
                    </div>
                </div>

                {matches.length === 0 ? (

                    <div className="team-leader-empty">
                        <h3>Nincsenek mérkőzések</h3>
                        <p>Jelenleg nincs a csapatodhoz rendelt mérkőzés.</p>
                    </div>

                ) : (

                    <div className="team-match-list">

                        {matches.map((match) => (

                            <div
                                className="team-match-card"
                                key={match.id}
                            >

                                <div className="team-match-top">

                                    <span>
                                        {match.championship_name}
                                    </span>

                                    <span className={`team-match-status status-${match.status}`}>
                                        {getStatus(match.status)}
                                    </span>

                                </div>

                                <p className="team-match-date">
                                    {formatDate(match.date_time)}
                                </p>

                                <div className="team-match-teams">

                                    <h3>{match.home_team_name}</h3>

                                    <div className="team-match-score">

                                        {match.home_score !== null &&
                                        match.away_score !== null ? (
                                            <>
                                                {match.home_score}
                                                <span>:</span>
                                                {match.away_score}
                                            </>
                                        ) : (
                                            <span>VS</span>
                                        )}

                                    </div>

                                    <h3>{match.away_team_name}</h3>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </section>

        </div>
    );
}

export default TeamLeader;
