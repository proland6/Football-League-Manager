import { Link } from "react-router";
import "../../styles/Home_style/Home_hero.css";

function Hero() {
    return (
        <section className="hero">
            <div className="hero_content">
                <h1>Football League Manager</h1>

                <p className="hero_subtitle">
                    A bajnokságok világa egy helyen.
                </p>

                <p>
                    Kövesd a bajnokságokat, böngészd az
                    eredményeket és ismerd meg a csapatokat.
                </p>

                <Link to="/championships" className="hero_button">
                    Bajnokságok megtekintése
                </Link>
            </div>
        </section>
    );
}

export default Hero;
