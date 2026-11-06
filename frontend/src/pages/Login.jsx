import "../styles/Login_style/Login.css";

import LoginHeader from "../components/login_components/Login_header";
import LoginForm from "../components/login_components/Login_form";
import LoginGoogle from "../components/login_components/Login_google";
import LoginFooter from "../components/login_components/Login_footer";

function Login() {
    return (
        <div className="login-page">
            <div className="login-container">

                <LoginHeader />

                <LoginForm />

                <LoginGoogle width="300"/>

                <LoginFooter />

            </div>
        </div>
    );
}

export default Login;