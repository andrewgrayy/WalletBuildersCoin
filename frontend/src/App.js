import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import CreateWallet from "./pages/CreateWallet";
import ImportWallet from "./pages/ImportWallet";
import TokenCreator from "./pages/TokenCreator";
import ContractWriter from "./pages/ContractWriter";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-wallet" element={<CreateWallet />} />
          <Route path="/import-wallet" element={<ImportWallet />} />
          <Route path="/token-creator" element={<TokenCreator />} />
          <Route path="/contract-writer" element={<ContractWriter />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;