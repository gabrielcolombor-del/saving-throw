import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Habilidades } from './pages/Habilidades';
import { Sistema } from './pages/Sistema';
import { Sons } from './pages/Sons';
import { Oneshots } from './pages/Oneshots';
import { Miniaturas } from './pages/Miniaturas';
import { Arsenal } from './pages/Arsenal';
import { Produto } from './pages/Produto';
import { Admin } from './pages/Admin';
import { InstrucoesMesa } from './pages/InstrucoesMesa';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="habilidades" element={<Habilidades />} />
          <Route path="sistema" element={<Sistema />} />
          <Route path="sons" element={<Sons />} />
          <Route path="oneshots" element={<Oneshots />} />
          <Route path="miniaturas" element={<Miniaturas />} />
          <Route path="arsenal" element={<Arsenal />} />
          <Route path="produto" element={<Produto />} />
          <Route path="admin" element={<Admin />} />
          <Route path="instrucoes-mesa" element={<InstrucoesMesa />} />
          <Route path="*" element={<div className="flex flex-col items-center justify-center min-h-[500px] text-center"><h1 className="text-4xl font-title text-amber-500 mb-4">Página em Construção</h1><p className="text-zinc-500">Esta página não foi encontrada.</p></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
