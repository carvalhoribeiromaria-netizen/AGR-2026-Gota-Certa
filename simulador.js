const formSimulador = document.getElementById("formSimulador");

formSimulador.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const dados = {
    nome: document.getElementById("nome").value.trim(),
    cultura: document.getElementById("cultura").value,
    solo: document.getElementById("solo").value,
    temperatura: document.getElementById("temperatura").value,
    umidade: document.getElementById("umidade").value,
    previsaoChuva: document.getElementById("previsaoChuva").value,
    fasePlanta: document.getElementById("fasePlanta").value,
    area: document.getElementById("area").value,
    data: new Date().toLocaleString("pt-BR")
  };

  const resultado = calcularResultado(dados);

  const simulacaoCompleta = {
    ...dados,
    ...resultado
  };

  const simulacoesSalvas = JSON.parse(localStorage.getItem("simulacoes")) || [];

  simulacoesSalvas.push(simulacaoCompleta);

  localStorage.setItem("simulacoes", JSON.stringify(simulacoesSalvas));

  mostrarResultado(resultado);
});

function calcularResultado(dados) {
  let indiceGotaCerta = 80;
  let risco = "Baixo";
  let recomendacao = "A irrigação está adequada para as condições informadas.";
  let dica = "Continue monitorando a umidade do solo antes de irrigar.";
  let selo = "Uso consciente da água";

  const temperatura = Number(dados.temperatura);
  const umidade = Number(dados.umidade);
  const area = Number(dados.area);

  if (temperatura >= 32) {
    indiceGotaCerta -= 15;
    risco = "Médio";
    recomendacao = "A temperatura está alta. Evite irrigar nos horários mais quentes.";
    dica = "Prefira irrigar no início da manhã ou no fim da tarde.";
  }

  if (umidade < 40) {
    indiceGotaCerta -= 20;
    risco = "Alto";
    recomendacao = "A umidade está baixa. Pode ser necessário aumentar o cuidado com a irrigação.";
    dica = "Verifique se o solo está realmente seco antes de irrigar.";
  }

  if (dados.previsaoChuva === "sim") {
    indiceGotaCerta += 10;
    recomendacao = "Há previsão de chuva. Considere reduzir ou adiar a irrigação.";
    dica = "Aproveitar a chuva ajuda a economizar água.";
  }

  if (dados.solo === "arenoso") {
    indiceGotaCerta -= 10;
    dica = "Solos arenosos perdem água mais rapidamente. Faça irrigações mais controladas.";
  }

  if (dados.solo === "argiloso") {
    indiceGotaCerta += 5;
    dica = "Solos argilosos retêm mais água. Evite excesso de irrigação.";
  }

  if (indiceGotaCerta > 100) {
    indiceGotaCerta = 100;
  }

  if (indiceGotaCerta < 0) {
    indiceGotaCerta = 0;
  }

  if (indiceGotaCerta >= 75) {
    risco = "Baixo";
    selo = "Excelente economia de água";
  } else if (indiceGotaCerta >= 50) {
    risco = "Médio";
    selo = "Boa prática de irrigação";
  } else {
    risco = "Alto";
    selo = "Atenção ao uso da água";
  }

  const litrosEconomizados = Math.round(area * indiceGotaCerta * 0.5);

  return {
    recomendacao,
    risco,
    litrosEconomizados,
    selo,
    dica,
    indiceGotaCerta
  };
}

function mostrarResultado(resultado) {
  const secaoResultado = document.getElementById("resultado");

  document.getElementById("resRecomendacao").textContent = resultado.recomendacao;
  document.getElementById("resRisco").innerHTML = criarBadgeRisco(resultado.risco);
  document.getElementById("resLitros").textContent = `${resultado.litrosEconomizados} litros`;
  document.getElementById("resSelo").textContent = resultado.selo;
  document.getElementById("resDica").textContent = resultado.dica;

  const barra = document.getElementById("barraIndice");
  barra.style.width = `${resultado.indiceGotaCerta}%`;
  barra.textContent = `${resultado.indiceGotaCerta}%`;

  secaoResultado.style.display = "block";
  secaoResultado.scrollIntoView({ behavior: "smooth" });
}

function criarBadgeRisco(risco) {
  const classe = risco.toLowerCase();

  return `<span class="badge badge-${classe}">${risco}</span>`;
}
