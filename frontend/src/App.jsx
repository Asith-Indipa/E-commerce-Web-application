import SearchBar from "./components/SearchBar";
import Header from "./components/header";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <>
        <SearchBar />
        <Header />
        <main className="pt-32 sm:pt-40">
          {/* Your pages go here */}
        </main>
      </>
    </BrowserRouter>
  );
}

export default App;