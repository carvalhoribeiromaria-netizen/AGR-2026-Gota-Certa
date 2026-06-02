async function carregarDashboard() {
  try {
    const resposta = await fetch("/api/dashboard");
    const dados = await resposta.json();

    document.getElementById("totalSimulacoes").textContent = dados.totalSimulacoes;
    document.getElementById("totalLitros").textContent = `${dados.totalLitrosEconomizados} L`;
    document.getElementById("mediaIndice").textContent = `${dados.mediaIndice}%`;
    document.getElementById("alertas").textContent = dados.alertasDesperdicio;

    montarGraficoCulturas(dados.culturas);
    montarGraficoRecomendacoes(dados.recomendacoes);
    montarRanking(dados.ranking);
  } catch (erro) {
    console.error("Erro ao carregar dashboard:", erro);
  }
}
function montarGraficoCulturas(culturas) {
  const nomes = Object.keys(culturas);
  const valores = Object.values(culturas);

  const contexto = document.getElementById("graficoCulturas");

  new Chart(contexto, {
    type: "bar",
    data: {
      labels: nomes.length ? nomes : ["Sem dados"],
      datasets: [
        {
          label: "Quantidade",
          data: valores.length ? valores : [0],
          backgroundColor: ["#43a047", "#1e88e5", "#fbc02d", "#8d6e63", "#e53935"]
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

function montarGraficoRecomendacoes(recomendacoes) {
  const nomes = Object.keys(recomendacoes);
  const valores = Object.values(recomendacoes);

  const contexto = document.getElementById("graficoRecomendacoes");

  new Chart(contexto, {
    type: "pie",
    data: {
      labels: nomes.length ? nomes : ["Sem dados"],
      datasets: [
        {
          data: valores.length ? valores : [1],
          backgroundColor: ["#43a047", "#1e88e5", "#fbc02d", "#e53935"]
        }
      ]
    },
    options: {
      responsive: true
    }
  });
}

function montarRanking(ranking) {
  const lista = document.getElementById("ranking");
  lista.innerHTML = "";

  if (ranking.length === 0) {
    lista.innerHTML = "<li>Nenhuma simulação cadastrada ainda.</li>";
    return;
  }

  ranking.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.nome} - ${item.litrosEconomizados} litros economizados - ${item.cultura}`;
    lista.appendChild(li);
  });
}

carregarDashboard();
