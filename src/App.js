import React, { useState } from 'react';
import './App.css';

function App() {
  const [cliente, setCliente] = useState('');
  const [servico, setServico] = useState('');
  const [valor, setValor] = useState('');

  const gerarOrcamento = () => {
    alert(`Orçamento para ${cliente}: ${servico} no valor de R$ ${valor}`);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>MetalCar Pro</h1>
        <p>Estética Automotiva de Alta Performance</p>
      </header>
      <main className="container">
        <input 
          type="text" 
          placeholder="Nome do Cliente" 
          onChange={(e) => setCliente(e.target.value)} 
        />
        <select onChange={(e) => setServico(e.target.value)}>
          <option value="">Selecione o Serviço</option>
          <option value="Polimento Comercial">Polimento Comercial</option>
          <option value="Vitrificaçao">Vitrificação</option>
          <option value="Martelinho de Ouro">Martelinho de Ouro</option>
        </select>
        <input 
          type="number" 
          placeholder="Valor R$" 
          onChange={(e) => setValor(e.target.value)} 
        />
        <button onClick={gerarOrcamento}>Gerar Orçamento</button>
      </main>
    </div>
  );
}

export default App;
