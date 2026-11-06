import { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import "../../styles/Login_style/Login_google.css";

function LoginGoogle() {

    const [error, setError] = useState("");

    const handleGoogleSuccess = async (credentialResponse) => {

        try {
            setError("");

            // 1. Google credential elküldése Django backendnek
            const response = await axios.post(
                "http://127.0.0.1:8000/api/google-login",
                {
                    credential: credentialResponse.credential
                }
            );

            // 2. JWT tokenek mentése
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

            // 4. Átirányítás jogosultság alapján
            if (roles.includes("admin")) {

                window.open(
                    "http://127.0.0.1:8000/admin/",
                    "_blank"
                );

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

            setError(
                err.response?.data?.error ||
                "Sikertelen Google-bejelentkezés."
            );
        }
    };

    return (
        <>
            <div className="login-divider">
                <span>VAGY</span>
            </div>

            <div className="login-google-container">

                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                        setError("A Google-bejelentkezés sikertelen.");
                    }}
                    text="signin_with"
                    shape="rectangular"
                    theme="outline"
                    width="300"
                />

            </div>

            {error && (
                <p className="login-error">{error}</p>
            )}
        </>
    );
}

export default LoginGoogle;