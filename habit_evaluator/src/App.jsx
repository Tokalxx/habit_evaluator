import { useState } from "react";
import HabitManager from "./HabitManager";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <HabitManager />
    </>
  );
}

export default App;
