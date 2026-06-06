import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./routes/Home";
import Recommend from "./routes/Recommend";
import Detail from "./routes/Detail";
import Layout from "./components/Layout";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Recommend />} />
          <Route path="/recommend" element={<Recommend />} />
          <Route path="/detail/:id" element={<Detail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
