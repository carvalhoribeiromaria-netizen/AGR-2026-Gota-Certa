const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "simulacoes.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function garantirArquivoDeDados() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify([], null, 2));
  }
}

function lerSimulacoes() {
  garantirArquivoDeDados();
  const conteudo = fs.readFileSync(dataFile, "utf-8");
  return JSON.parse(conteudo || "[]");
}

function salvarSimulacoes(simulacoes) {
  garantirArquivoDeDados();
  fs.writeFileSync(dataFile, JSON.stringify(simulacoes, null, 2));
}

function calcularIndiceGotaCerta(dados) {
  let pontos = 0;

  if (dados.umidade === "baixa") {
    pontos += 30;
  } else if (dados.umidade === "media") {
    pontos += 15;
  } else if (dados.umidade === "alta") {
    pontos += 0;
  }

  const temperatura = Number(dados.temperatura);

  if (temperatura >= 35) {
    pontos += 25;
  } else if (temperatura >= 30) {
    pontos += 18;
  } else if (temperatura >= 25) {
    pontos += 10;
  } else {
    pontos += 5;
  }

  if (dados.previsaoChuva === "nao") {
    pontos += 25;
  } else if (dados.previsaoChuva === "sim") {
    pontos -= 20;
  }

  if (dados.solo === "arenoso") {
    pontos += 15;
  } else if (dados.solo === "misto") {
    pontos += 10;
  } else if (dados.solo === "argiloso") {
    pontos += 5;
  }

  if (dados.fasePlanta === "germinacao") {
    pontos += 15;
  } else if (dados.fasePlanta === "crescimento") {
    pontos += 12;
  } else if (dados.fasePlanta === "producao") {
    pontos += 10;
  } else if (dados.fasePlanta === "colheita") {
    pontos += 3;
  }

  if (dados.cultura === "hortalicas") {
    pontos += 10;
  } else if (dados.cultura === "milho") {
    pontos += 8;
  } else if (dados.cultura === "mandioca") {
    pontos += 5;
  } else if (dados.cultura === "soja") {
    pontos += 6;
  } else if (dados.cultura === "pastagem") {
    pontos += 4;
  }

  if (pontos < 0) {
    pontos = 0;
  }

  if (pontos > 100) {
    pontos = 100;
  }

  return pontos;
}

function gerarRecomendacao(indice) {
  if (indice <= 30) {
    return "Não irrigar no momento";
  }

  if (indice <= 60) {
    return "Realizar irrigação leve";
  }

  if (indice <= 85) {
    return "Realizar irrigação moderada";
  }

  return "Irrigação necessária com atenção";
}

function calcularLitrosEconomizados(area, indice) {
  const areaNumero = Number(area);

  if (indice <= 30) {
    return Math.round(areaNumero * 2.5);
  }

  if (indice <= 60) {
    return Math.round(areaNumero * 1.2);
  }

  if (indice <= 85) {
    return Math.round(areaNumero * 0.4);
  }

  return 0;
}

function calcularRisco(indice) {
  if (indice <= 30) {
    return "Baixo";
  }

  if (indice <= 60) {
    return "Moderado";
  }

  if (indice <= 85) {
    return "Alto";
  }

  return "Crítico";
}

function gerarSelo(indice, previsaoChuva) {
  if (previsaoChuva === "sim" && indice <= 60) {
    return "Selo Gota Certa: decisão consciente, aguarde a chuva";
  }

  if (indice <= 30) {
    return "Selo Gota Certa: economia máxima de água";
  }

  if (indice <= 60) {
    return "Selo Gota Certa: irrigação responsável";
  }

  if (indice <= 85) {
    return "Selo Gota Certa: atenção ao uso da água";
  }

  return "Selo Gota Certa: irrigação necessária, evite desperdícios";
}

function gerarDica(dados, indice) {
  if (dados.previsaoChuva === "sim" && indice <= 60) {
    return "Existe previsão de chuva. Aguardar pode evitar desperdício de água.";
  }

  if (dados.umidade === "alta") {
    return "O solo já apresenta boa umidade. Evite irrigar sem necessidade.";
  }

  if (Number(dados.temperatura) >= 35) {
    return "Com temperatura muito alta, prefira irrigar no início da manhã ou no fim da tarde.";
  }

  if (dados.solo === "arenoso") {
    return "Solos arenosos perdem água mais rapidamente. Monitore a umidade com frequência.";
  }

  if (indice > 85) {
    return "A irrigação é necessária, mas deve ser feita com controle para evitar desperdício.";
  }

  return "Observe o solo, a planta e a previsão do tempo antes de irrigar.";
}

function validarDados(dados) {
  const camposObrigatorios = [
    "nome",
    "cultura",
    "solo",
    "temperatura",
    "umidade",
    "previsaoChuva",
    "fasePlanta",
    "area"
  ];

  for (const campo of camposObrigatorios) {
    if (!dados[campo]) {
      return `O campo ${campo} é obrigatório.`;
    }
  }

  if (Number(dados.temperatura) < 0 || Number(dados.temperatura) > 60) {
    return "A temperatura deve estar entre 0 e 60 graus.";
  }

  if (Number(dados.area) <= 0) {
    return "A área deve ser maior que zero.";
  }

  return null;
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/simulacoes", (req, res) => {
  const simulacoes = lerSimulacoes();
  res.json(simulacoes);
});

app.post("/api/simulacoes", (req, res) => {
  const dados = req.body;

  const erro = validarDados(dados);

  if (erro) {
    return res.status(400).json({ erro });
  }

  const indiceGotaCerta = calcularIndiceGotaCerta(dados);
  const recomendacao = gerarRecomendacao(indiceGotaCerta);
  const litrosEconomizados = calcularLitrosEconomizados(dados.area, indiceGotaCerta);
  const risco = calcularRisco(indiceGotaCerta);
  const selo = gerarSelo(indiceGotaCerta, dados.previsaoChuva);
  const dica = gerarDica(dados, indiceGotaCerta);

  const novaSimulacao = {
    id: Date.now(),
    nome: dados.nome,
    cultura: dados.cultura,
    solo: dados.solo,
    temperatura: Number(dados.temperatura),
    umidade: dados.umidade,
    previsaoChuva: dados.previsaoChuva,
    fasePlanta: dados.fasePlanta,
    area: Number(dados.area),
    indiceGotaCerta,
    recomendacao,
    litrosEconomizados,
    risco,
    selo,
    dica,
    data: new Date().toLocaleString("pt-BR")
  };

  const simulacoes = lerSimulacoes();
  simulacoes.push(novaSimulacao);
  salvarSimulacoes(simulacoes);

  res.status(201).json(novaSimulacao);
});

app.get("/api/dashboard", (req, res) => {
  const simulacoes = lerSimulacoes();

  const totalSimulacoes = simulacoes.length;

  const totalLitrosEconomizados = simulacoes.reduce((total, item) => {
    return total + Number(item.litrosEconomizados || 0);
  }, 0);

  const mediaIndice = totalSimulacoes > 0
    ? Math.round(
        simulacoes.reduce((total, item) => total + Number(item.indiceGotaCerta || 0), 0) / totalSimulacoes
      )
    : 0;

  const alertasDesperdicio = simulacoes.filter((item) => {
    return item.previsaoChuva === "sim" && item.indiceGotaCerta <= 60;
  }).length;

  const culturas = {};

  simulacoes.forEach((item) => {
    culturas[item.cultura] = (culturas[item.cultura] || 0) + 1;
  });

  let culturaMaisSimulada = "Nenhuma";

  if (Object.keys(culturas).length > 0) {
    culturaMaisSimulada = Object.keys(culturas).reduce((a, b) => {
      return culturas[a] > culturas[b] ? a : b;
    });
  }

  const recomendacoes = {};

  simulacoes.forEach((item) => {
    recomendacoes[item.recomendacao] = (recomendacoes[item.recomendacao] || 0) + 1;
  });

  const ranking = [...simulacoes]
    .sort((a, b) => b.litrosEconomizados - a.litrosEconomizados)
    .slice(0, 5);

  res.json({
    totalSimulacoes,
    totalLitrosEconomizados,
    mediaIndice,
    alertasDesperdicio,
    culturaMaisSimulada,
    culturas,
    recomendacoes,
    ranking
  });
});

app.delete("/api/simulacoes/:id", (req, res) => {
  const id = Number(req.params.id);
  const simulacoes = lerSimulacoes();

  const novasSimulacoes = simulacoes.filter((item) => item.id !== id);

  salvarSimulacoes(novasSimulacoes);

  res.json({ mensagem: "Simulação removida com sucesso." });
});

app.listen(PORT, () => {
  garantirArquivoDeDados();
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
