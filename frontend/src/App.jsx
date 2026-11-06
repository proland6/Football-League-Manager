import { Route, Routes } from "react-router";
import Navbar from "./components/Navbar";
import "./styles/App.css"

import Home from "./pages/Home"
import Championships from "./pages/Championships"
import Teams from "./pages/Teams"
import Players from "./pages/Players"
import Login from "./pages/Login"
import RefereeMatches from "./pages/Referee_matches";

function App(){
  return(
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/championships" element={<Championships />}/>
          <Route path="/teams/:teamId" element={<Teams />}/>
          <Route path="/players/:playerId" element={<Players />} />
          <Route path="/login" element={<Login />}/>
          <Route path="/referee/matches/" element={<RefereeMatches />}/>
          
        </Routes>
      </main>
    </>
    

  );
}

export default App;