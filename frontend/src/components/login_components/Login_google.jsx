import "../../styles/Login_style/Login_google.css"

function LoginGoogle() {
    return (
        <>
            <div className="login-divider">
                <span>VAGY</span>
            </div>

            <button type="button" className="google-login">
                <span>G</span>
                Bejelentkezés Google-fiókkal
            </button>
        </>
    );
}

export default LoginGoogle;