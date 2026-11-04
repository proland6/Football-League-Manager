import "../../styles/Login_style/Login_form.css"

function LoginForm() {
    return (
        <form className="login-form">
            <div className="form-group">
                <label htmlFor="email">Email cím</label>
                <input
                    type="email"
                    id="email"
                    placeholder="pelda@email.com"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="password">Jelszó</label>
                <input
                    type="password"
                    id="password"
                    placeholder="Add meg a jelszavad"
                    required
                />
            </div>

            <button type="submit" className="login-button">
                Bejelentkezés
            </button>
        </form>
    );
}

export default LoginForm;