import { useState } from "react";

//components
import Chess from "./components/Chess";

function App() {
  const [count, setCount] = useState(0);

  return (
    //has que todo este sentrado con tailwind
    <div className="flex justify-center items-center h-screen">
      <Chess />
    </div>
  );
}

export default App;
