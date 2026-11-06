
import { useState } from "react";
import axios from "axios";
import "../../styles/Login_style/Login_form.css";

function LoginForm() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            // 1. Bejelentkezés
            const response = await axios.post(
                "http://127.0.0.1:8000/api/login/",
                {
                    email,
                    password
                }
            );

            // 2. Tokenek mentése
            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);

            // 3. Jogosultság lekérdezése
            const roleResponse = await axios.get(
                "http://127.0.0.1:8000/api/user/role/",
                {
                    headers: {
                        Authorization: `Bearer ${response.data.access}`
                    }
                }
            );

            const roles = roleResponse.data.roles;
            console.log("Backend roles:", roleResponse.data);
            console.log("Roles változó:", roles);

            // 4. Átirányítás jogosultság alapján
            if(roles.includes("admin")){
                window.open("http://127.0.0.1:8000/admin/","_blank")
            } else if (roles.includes("referee")) {

                window.location.href = "/referee/matches/";

            } else if (roles.includes("team_leader")) {

                window.location.href = "/team-leader/";

            } else {

                window.location.href = "/";
            }

        } catch (err) {

            localStorage.removeItem("access");
            localStorage.removeItem("refresh");

            if (err.response) {
                setError(
                    err.response.data.error ||
                    "Sikertelen bejelentkezés vagy jogosultság-ellenőrzés."
                );
            } else {
                setError("Nem sikerült kapcsolódni a szerverhez.");
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="login-form" onSubmit={handleLogin}>

            <div className="login-form-group">
                <label htmlFor="email">Email cím</label>

                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pelda@email.com"
                    autoComplete="username"
                    required
                />
            </div>

            <div className="login-form-group">
                <label htmlFor="password">Jelszó</label>

                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Add meg a jelszavad"
                    autoComplete="current-password"
                    required
                />
            </div>

            {error && (
                <p className="login-error">{error}</p>
            )}

            <button
                type="submit"
                className="login-button"
                disabled={loading}
            >
                {loading ? "Bejelentkezés..." : "Bejelentkezés"}
            </button>

        </form>
    );
}

export default LoginForm;
