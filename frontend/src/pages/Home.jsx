import { Link } from "react-router";
import Hero from "../components/home_components/Home_hero"
import ActiveChampionships from "../components/home_components/Home_active_championship";
import Result from "../components/home_components/Home_result"

function Home(){
    return(
        <>
            <Hero/>
            <ActiveChampionships/>
            <Result/>
        </>


    );
}

export default Home;