import React, { useState } from 'react';
import './App.css';

function App() {
  const [cliente, setCliente] = useState('');
  const [servico, setServico] = useState('');
  const [valor, setValor] = useState('');

  const gerarOrcamento = () => {
    if(!cliente || !valor) {
      alert("Por favor, preencha o nome e o valor.");
      return;
    }
    alert(`Orçamento MetalCar Pro\nCliente: ${cliente}\nServiço: ${servico}\nValor: R$ ${valor}`);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>MetalCar Pro</h1>
        <p>Estética Automotiva - Frederico Westphalen</p>
      </header>
      <div className="form-container">
        <input 
          type="text" 
          placeholder="Nome do Cliente" 
          value={cliente}
          onChange={(e) => setCliente(e.target.value)} 
        />
        <select value={servico} onChange={(e) => setServico(e.target.value)}>
          <option value="">Selecione o Serviço</option>
          <option value="Polimento Comercial">Polimento Comercial</option>
          <option value="Vitrificaçao">Vitrificação</option>
          <option value="Martelinho de Ouro">Martelinho de Ouro</option>
          <option value="Higienização Interna">Higienização Interna</option>
        </select>
        <input 
          type="number" 
          placeholder="Valor R$" 
          value={valor}
          onChange={(e) => setValor(e.target.value)} 
        />
        <button onClick={gerarOrcamento}>Gerar Orçamento</button>
      </div>
    </div>
  );
}

export default App;
