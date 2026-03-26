import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";

export default function App() {
  // --- ACESSO E SEGURANÇA ---
  const [logado, setLogado] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  // --- CONFIGURAÇÕES DA EMPRESA ---
  const [step, setStep] = useState(1);
  const [nomeEmpresa, setNomeEmpresa] = useState("METALCAR PRO");
  const [cnpjEmpresa, setCnpjEmpresa] = useState("40.236.750/0001-81");
  const [editandoInfo, setEditandoInfo] = useState(false);
  const [editandoPrecos, setEditandoPrecos] = useState(false);

  // --- DADOS DO ORÇAMENTO ---
  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [placa, setPlaca] = useState("");
  const [previsao, setPrevisao] = useState("");
  const [veiculo, setVeiculo] = useState(""); 
  const [categoria, setCategoria] = useState("");
  const [servicoAtivo, setServicoAtivo] = useState(""); 
  const [items, setItems] = useState([]);

  // --- TABELA DE PREÇOS INTEGRAL (AQUI ESTÁ O VOLUME DE LINHAS) ---
  const [precosBase, setPrecosBase] = useState(() => {
    const salvo = localStorage.getItem("metalcar_v26_precos");
    return salvo ? JSON.parse(salvo) : {
      // PINTURA CARRO
      "Capô": 450, "Porta": 350, "Teto": 600, "Para-choque": 400, "Para-lama": 350, "Rodas (Pintura)": 200, "Lateral": 400, "Tampa Traseira": 350, "Retrovisor": 120, "Maçaneta": 80,
      // PINTURA MOTO
      "Tanque": 350, "Para-lama Moto": 180, "Carenagem": 250, "Rodas Moto": 150, "Chassi": 500, "Balança": 220, "Bengala": 140,
      // LAVA CAR
      "Lavagem Interna": 60, "Lavagem Externa": 60, "Lavagem Completa": 110, "Lavagem Detalhada": 220, "Lavagem de Motor": 90, "Chassi (Lavagem)": 100,
      // ESTÉTICA
      "Polimento Comercial": 350, "Espelhamento": 600, "Vitrificação de Pintura": 1200, "Vitrificação de Faróis": 150, "Higienização Interna": 280, "Limpeza de Couro": 180, "Revitalização de Plásticos": 120, "Descontaminação de Pintura": 150,
      // PELÍCULAS
      "Para-brisa": 150, "Vidros Laterais": 220, "Vidro Traseiro": 180, "Película Completa": 480, "Remoção de Película": 100,
      // MARTELINHO CARRO
      "Pequeno Amassado": 150, "Médio Amassado": 300, "Grande Amassado": 550, "Chuva de Granizo": 1500, "Vincos": 250,
      // MARTELINHO MOTO (O QUE VOCÊ PEDIU)
      "Tanque (Martelinho)": 350, "Para-lama Moto (M)": 150, "Vincos de Tanque": 280
    };
  });

  const carMenus = {
    "Pintura": ["Capô", "Porta", "Teto", "Para-choque", "Para-lama", "Lateral", "Tampa Traseira", "Retrovisor", "Rodas (Pintura)"],
    "Lava Car": ["Lavagem Interna", "Lavagem Externa", "Lavagem Completa", "Lavagem Detalhada", "Lavagem de Motor"],
    "Estética": ["Polimento Comercial", "Espelhamento", "Vitrificação de Pintura", "Higienização Interna", "Limpeza de Couro", "Revitalização de Plásticos"],
    "Películas": ["Para-brisa", "Vidros Laterais", "Vidro Traseiro", "Película Completa"],
    "Martelinho": ["Pequeno Amassado", "Médio Amassado", "Grande Amassado", "Chuva de Granizo", "Vincos"]
  };

  const motoMenus = {
    "Pintura": ["Tanque", "Para-lama Moto", "Carenagem", "Rodas Moto", "Chassi", "Balança"],
    "Lava Car": ["Lavagem Simples Moto", "Lavagem Detalhada Moto"],
    "Estética": ["Polimento de Tanque", "Vitrificação Moto", "Revitalização de Plásticos"],
    "Martelinho": ["Tanque (Martelinho)", "Para-lama Moto (M)", "Vincos de Tanque"]
  };

  const sBtn = (sel, c="#1a1a1a") => ({ padding: "16px", margin: "5px 0", borderRadius: "10px", width: "100%", background: sel ? "#22c55e" : c, color: "#fff", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "14px" });
  const sInput = { width: "100%", padding: "15px", marginBottom: "10px", background: "#111", color: "#fff", border: "1px solid #333", borderRadius: "8px", boxSizing: "border-box" };
  // --- PERSISTÊNCIA E DADOS ---
  const [historico, setHistorico] = useState(() => JSON.parse(localStorage.getItem("metalcar_v26_hist") || "[]"));
  const [gastos, setGastos] = useState(() => JSON.parse(localStorage.getItem("metalcar_v26_gastos") || "[]"));
  const [novoGasto, setNovoGasto] = useState({ desc: "", valor: "" });

  // --- FUNÇÕES DE LÓGICA E CÁLCULO ---
  const obterPrecoSugerido = (nome) => {
    let base = precosBase[nome] || 250;
    const mult = { 
      "Sedan": 1.15, "SUV": 1.35, "Picape": 1.45, 
      "Esportiva": 1.25, "Custom": 1.30, "Trail": 1.15 
    };
    return Math.round(base * (mult[categoria] || 1));
  };

  const addItem = (nome) => {
    setItems([...items, { nome: `${servicoAtivo} - ${nome}`, valor: obterPrecoSugerido(nome) }]);
    setStep(5);
  };

  const removerItem = (index) => {
    const novaLista = items.filter((_, i) => i !== index);
    setItems(novaLista);
    if (novaLista.length === 0) setStep(3);
  };

  const finalizar = (status) => {
    const novo = { 
      cliente, placa, telefone, 
      total: items.reduce((a,b)=>a+b.valor,0), 
      status, data: new Date().toLocaleDateString(), 
      items, previsao, veiculo, categoria 
    };
    const lista = [novo, ...historico];
    setHistorico(lista);
    localStorage.setItem("metalcar_v26_hist", JSON.stringify(lista));
    if(status === "Aprovado") gerarPDF();
    resetar();
  };

  const resetar = () => { 
    setStep(1); setItems([]); setVeiculo(""); setCategoria(""); 
    setServicoAtivo(""); setCliente(""); setPlaca(""); setTelefone(""); setPrevisao("");
  };

  // --- GERADOR DE PDF PROFISSIONAL ---
  const gerarPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold"); 
    doc.text(nomeEmpresa, 10, 15);
    doc.setFontSize(9); 
    doc.text(`CNPJ: ${cnpjEmpresa}`, 10, 22);
    doc.line(10, 25, 200, 25);
    
    doc.text(`CLIENTE: ${cliente.toUpperCase()}`, 10, 32);
    doc.text(`WHATSAPP: ${telefone}`, 10, 38);
    doc.text(`VEÍCULO: ${veiculo} (${categoria}) | PLACA: ${placa.toUpperCase()}`, 10, 44);
    doc.text(`PREVISÃO DE ENTREGA: ${previsao || 'A combinar'}`, 10, 50);
    
    let y = 65;
    doc.text("DESCRIÇÃO DOS SERVIÇOS", 10, 60);
    doc.setFont("helvetica", "normal");
    items.forEach(i => { 
      doc.text(`- ${i.nome}`, 10, y); 
      doc.text(`R$ ${i.valor.toFixed(2)}`, 160, y); 
      y += 8; 
    });
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14); 
    const total = items.reduce((a,b)=>a+b.valor,0);
    doc.text(`TOTAL DO ORÇAMENTO: R$ ${total.toFixed(2)}`, 140, y + 15);
    
    doc.setFontSize(8);
    doc.text("Este orçamento tem validade de 10 dias.", 10, 275);
    doc.text("© 2026 METALCAR PRO - Frederico Westphalen/RS", 10, 280);
    doc.save(`Orcamento_${placa || cliente}.pdf`);
  };

  const realizarBackup = () => {
    const data = { historico, gastos, precosBase, nomeEmpresa, cnpjEmpresa };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `backup_metalcar_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    link.click();
  };
  // --- TELA DE LOGIN ---
  if (!logado) {
    return (
      <div style={{ padding: "40px 20px", background: "#000", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", fontFamily: "sans-serif" }}>
        <h1 style={{ color: "#22c55e", marginBottom: "30px", letterSpacing: "2px" }}>METALCAR PRO</h1>
        <div style={{ background: "#111", padding: "30px", borderRadius: "20px", width: "100%", maxWidth: "350px", border: "1px solid #22c55e", boxShadow: "0 10px 25px rgba(34, 197, 94, 0.2)" }}>
          <h3 style={{ color: "#fff", marginTop: 0, textAlign: "center", marginBottom: "20px" }}>Acesso Restrito</h3>
          <input placeholder="Usuário" style={sInput} value={user} onChange={(e) => setUser(e.target.value)} />
          <input type="password" placeholder="Senha" style={sInput} value={pass} onChange={(e) => setPass(e.target.value)} />
          <button onClick={() => { if (user === "admin" && pass === "metalcar2026") { setLogado(true); } else { alert("Acesso Negado!"); } }} style={sBtn(true)}>ENTRAR NO SISTEMA</button>
        </div>
        <p style={{ color: "#444", marginTop: "20px", fontSize: "12px" }}>© 2026 METALCAR PRO - Frederico Westphalen/RS</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", background: "#000", color: "#eee", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <button onClick={() => setLogado(false)} style={{ float: "right", background: "none", color: "#ef4444", border: "none", fontSize: "12px", cursor: "pointer", fontWeight: "bold" }}>SAIR 🚪</button>

      <div style={{textAlign:'center', marginBottom:'20px', clear:'both'}}>
        <h1 style={{ color: "#22c55e", margin:0 }}>{nomeEmpresa}</h1>
        <div style={{display:'flex', gap:'10px', justifyContent:'center', marginTop:'10px'}}>
           <button onClick={() => setEditandoInfo(!editandoInfo)} style={{background:'#222', color:'#fff', border:'none', padding:'8px 12px', borderRadius:'8px', cursor: 'pointer'}}>✏️ Dados</button>
           <button onClick={() => setEditandoPrecos(!editandoPrecos)} style={{background:'#222', color:'#fff', border:'none', padding:'8px 12px', borderRadius:'8px', cursor: 'pointer'}}>⚙️ Preços</button>
        </div>
      </div>

      {/* AGORA O BOTÃO DADOS VAI FUNCIONAR COM ESTE BLOCO ABAIXO: */}
      {editandoInfo && (
        <div style={{background:'#111', padding:'15px', borderRadius:'15px', marginBottom:'20px', border:'1px solid #3b82f6'}}>
          <h4 style={{color:'#3b82f6', marginTop:0}}>Editar Informações da Empresa</h4>
          <label style={{fontSize:'11px', color:'#666'}}>Nome da Oficina:</label>
          <input style={sInput} value={nomeEmpresa} onChange={e => setNomeEmpresa(e.target.value)} />
          <label style={{fontSize:'11px', color:'#666'}}>CNPJ:</label>
          <input style={sInput} value={cnpjEmpresa} onChange={e => setCnpjEmpresa(e.target.value)} />
          <button onClick={() => setEditandoInfo(false)} style={{...sBtn(true), background:'#3b82f6'}}>Salvar Alterações</button>
        </div>
      )}

      {editandoPrecos && (
        <div style={{background:'#111', padding:'15px', borderRadius:'15px', marginBottom:'20px', border:'1px solid #22c55e', maxHeight:'50vh', overflowY:'auto'}}>
          <h4 style={{color:'#22c55e', marginTop:0}}>Ajuste de Preços Base</h4>
          {Object.keys(precosBase).map(p => (
            <div key={p} style={{display:'flex', justifyContent:'space-between', marginBottom: '8px', borderBottom: '1px solid #222', paddingBottom: '4px'}}>
              <small>{p}:</small>
              <input type="number" defaultValue={precosBase[p]} style={{width:'70px', background:'#222', color:'#fff', border:'1px solid #444', borderRadius:'4px'}} onBlur={(e) => {
                const n = {...precosBase, [p]: Number(e.target.value)};
                setPrecosBase(n); localStorage.setItem("metalcar_v26_precos", JSON.stringify(n));
              }} />
            </div>
          ))}
          <button onClick={() => setEditandoPrecos(false)} style={{...sBtn(true), marginTop:'10px'}}>Salvar e Fechar</button>
        </div>
      )}

      {step === 1 && (
        <div style={{marginTop:'20px'}}>
          <input placeholder="Nome do Cliente" style={sInput} value={cliente} onChange={e => setCliente(e.target.value)} />
          <input placeholder="WhatsApp (DDD + Número)" style={sInput} value={telefone} onChange={e => setTelefone(e.target.value)} />
          <input placeholder="Placa do Veículo" style={sInput} value={placa} onChange={e => setPlaca(e.target.value)} />
          <input type="date" style={sInput} value={previsao} onChange={e => setPrevisao(e.target.value)} />
          <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
            <button style={sBtn(veiculo === "Carro")} onClick={() => {setVeiculo("Carro"); setStep(2);}}>🚗 Carro</button>
            <button style={sBtn(veiculo === "Moto")} onClick={() => {setVeiculo("Moto"); setStep(2);}}>🏍️ Moto</button>
          </div>
          <div style={{marginTop:'30px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
            <button onClick={() => setStep(6)} style={sBtn(false, "#3b82f6")}>📁 Histórico</button>
            <button onClick={() => setStep(8)} style={sBtn(false, "#f59e0b")}>💰 Gastos</button>
            <button onClick={() => setStep(9)} style={{...sBtn(false, "#8b5cf6"), gridColumn: 'span 2'}}>📊 Relatórios</button>
          </div>
        </div>
      )}

      {step > 1 && step < 6 && (
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
          <button onClick={() => setStep(step - 1)} style={{background:'none', color:'#22c55e', border:'none', cursor:'pointer', fontWeight:'bold'}}>← Voltar</button>
          <button onClick={resetar} style={{background:'none', color:'#ef4444', border:'none', cursor:'pointer'}}>🏠 Início</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3>Selecione o Porte:</h3>
          {(veiculo === "Carro" ? ["Hatch", "Sedan", "SUV", "Picape"] : ["Street", "Naked", "Esportiva", "Custom", "Trail"]).map(cat => (
            <button key={cat} style={sBtn(categoria === cat)} onClick={() => {setCategoria(cat); setStep(3);}}>{cat}</button>
          ))}
        </div>
      )}

      {step === 3 && (
        <div>
          <h3>Área de Atuação:</h3>
          {Object.keys(veiculo === "Carro" ? carMenus : motoMenus).map(s => (
            <button key={s} style={sBtn(servicoAtivo === s)} onClick={() => {setServicoAtivo(s); setStep(4);}}>{s}</button>
          ))}
        </div>
      )}

      {step === 4 && (
        <div style={{maxHeight:'450px', overflowY:'auto'}}>
          <h3>Escolha o Item:</h3>
          {(veiculo === "Carro" ? carMenus[servicoAtivo] : motoMenus[servicoAtivo])?.map(p => (
            <button key={p} style={sBtn()} onClick={() => addItem(p)}>{p}</button>
          ))}
        </div>
      )}

      {step === 5 && (
        <div>
          <h3>Resumo:</h3>
          <div style={{background:'#111', padding:'15px', borderRadius:'10px', marginBottom:'20px', border:'1px solid #333'}}>
            {items.map((it, i) => (
              <div key={i} style={{display:'flex', justifyContent:'space-between', marginBottom:'10px', borderBottom:'1px solid #222', paddingBottom:'5px'}}>
                <span>{it.nome}</span>
                <strong>R$ {it.valor} <button onClick={() => removerItem(i)} style={{background:'none', color:'#ef4444', border:'none', marginLeft:'10px'}}>X</button></strong>
              </div>
            ))}
            <h2 style={{textAlign:'right', color:'#22c55e', marginTop:'20px'}}>Total: R$ {items.reduce((a,b)=>a+b.valor,0)}</h2>
          </div>
          <button onClick={() => finalizar("Aprovado")} style={sBtn(true)}>✅ GERAR PDF</button>
        </div>
      )}

      {step === 6 && (
        <div>
          <button onClick={() => setStep(1)} style={sBtn(false, "#333")}>← Voltar</button>
          <h3>Histórico</h3>
          {historico.map((h, i) => (
            <div key={i} style={{background:'#111', padding:'12px', marginBottom:'8px', borderRadius:'10px', borderLeft:'4px solid #3b82f6'}}>
              <strong>{h.cliente}</strong> - {h.data}<br/>
              <small>{h.veiculo} - R$ {h.total}</small>
            </div>
          ))}
        </div>
      )}

      {step === 8 && (
        <div>
          <button onClick={() => setStep(1)} style={sBtn(false, "#333")}>← Voltar</button>
          <h3>Lançar Gasto</h3>
          <input placeholder="Descrição" style={sInput} id="descGasto" />
          <input placeholder="Valor R$" type="number" style={sInput} id="valGasto" />
          <button onClick={() => {
            const d = document.getElementById("descGasto").value;
            const v = Number(document.getElementById("valGasto").value);
            if(d && v) {
              const nG = [...gastos, {desc: d, valor: v, data: new Date().toLocaleDateString()}];
              setGastos(nG); localStorage.setItem("metalcar_v26_gastos", JSON.stringify(nG));
              alert("Salvo!"); setStep(1);
            }
          }} style={sBtn(true)}>Salvar</button>
        </div>
      )}

      {step === 9 && (
        <div>
          <button onClick={() => setStep(1)} style={sBtn(false, "#333")}>← Voltar</button>
          <div style={{background:'#111', padding:'20px', borderRadius:'15px', marginTop:'15px', textAlign:'center', border: '1px solid #22c55e'}}>
            <small>LUCRO LÍQUIDO</small>
            <h1 style={{color:'#22c55e', margin:0}}>R$ {(historico.reduce((a,b)=>a+b.total,0) - gastos.reduce((a,b)=>a+b.valor,0)).toFixed(2)}</h1>
          </div>
        </div>
      )}
    </div>
  );
}