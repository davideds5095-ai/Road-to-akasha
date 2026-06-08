import { useState } from "react";
import Akasha from "./Akasha"; // se non esiste lo lasciamo come componente interno
import Book from "./Book";

export default function App() {
  const [page, setPage] = useState("home");

  return (
    <div style={{ padding: 20 }}>
      
      {/* NAV BAR */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setPage("home")}>Home</button>
        <button onClick={() => setPage("akasha")}>Akasha</button>
        <button onClick={() => setPage("book")}>Book</button>
      </div>

      {/* PAGES */}
      {page === "home" && <Home setPage={setPage} />}
      {page === "akasha" && <Akasha setPage={setPage} />}
      {page === "book" && <Book />}
      
    </div>
  );
}

function Home({ setPage }) {
  return (
    <div>
      <h1>Home</h1>
      <button onClick={() => setPage("akasha")}>Vai ad Akasha</button>
      <button onClick={() => setPage("book")}>Book</button>
    </div>
  );
}
