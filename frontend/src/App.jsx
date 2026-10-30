import { Route, Routes } from "react-router";
import Navbar from "./components/Navbar";
import "./styles/App.css"

import Home from "./pages/Home"
import Championships from "./pages/Championships"
import Teams from "./pages/Teams"
import Players from "./pages/Players"
import Matches from "./pages/Matches"
import Login from "./pages/Login"

function App(){
  return(
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/championships" element={<Championships />}/>
          <Route path="/teams" element={<Teams />}/>
          <Route path="/players" element={<Players />}/>
          <Route path="/matches" element={<Matches />}/>
          <Route path="/login" element={<Login />}/>
          
        </Routes>
      </main>
    </>
    

  );
}

export default App;