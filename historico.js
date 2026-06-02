let simulacoes = [];

async function carregarHistorico() {
  try {
    const resposta = await fetch("/api/simulacoes");
    simulacoes = await resposta.json();
    renderizarTabela(simulacoes);
  } catch (erro) {
    console.error("Erro ao carregar histórico:", erro);
  }
}

function renderizarTabela(lista) {
  const corpoTabela = document.getElementById("corpoTabela");
  corpoTabela.innerHTML = "";

  if (lista.length === 0) {
    corpoTabela.innerHTML = `
      <tr>
        <td colspan="10">Nenhuma simulação encontrada.</td>
      </tr>
    `;
    return;
  }

  lista.forEach((item) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.data}</td>
      <td>${item.nome}</td>
      <td>${formatarTexto(item.cultura)}</td>
      <td>${formatarTexto(item.solo)}</td>
      <td>${item.temperatura}°C</td>
      <td>${item.recomendacao}</td>
      <td>${item.indiceGotaCerta}%</td>
      <td>${criarBadgeRisco(item.risco)}</td>
      <td>${item.litrosEconomizados} L</td>
      <td>
        <button class="btn btn-vermelho" onclick="removerSimulacao(${item.id})">Excluir</button>
      </td>
    `;

    corpoTabela.appendChild(tr);
  });
}

function aplicarFiltros() {
  const cultura = document.getElementById("filtroCultura").value;
  const risco = document.getElementById("filtroRisco").value;
  const nome = document.getElementById("filtroNome").value.toLowerCase();

  let filtradas = simulacoes;

  if (cultura) {
    filtradas = filtradas.filter((item) => item.cultura === cultura);
  }

  if (risco) {
    filtradas = filtradas.filter((item) => item.risco === risco);
  }

  if (nome) {
    filtradas = filtradas.filter((item) => item.nome.toLowerCase().includes(nome));
  }

  renderizarTabela(filtradas);
}

async function removerSimulacao(id) {
  const confirmar = confirm("Deseja excluir esta simulação?");

  if (!confirmar) {
    return;
  }

  try {
    await fetch(`/api/simulacoes/${id}`, {
      method: "DELETE"
    });

    carregarHistorico();
  } catch (erro) {
    alert("Erro ao remover simulação.");
    console.error(erro);
  }
}

function criarBadgeRisco(risco) {
  const classe = risco.toLowerCase().replace("í", "i");

  return `<span class="badge badge-${classe}">${risco}</span>`;
}

function formatarTexto(texto) {
  const mapa = {
    mandioca: "Mandioca",
    milho: "Milho",
    soja: "Soja",
    hortalicas: "Hortaliças",
    pastagem: "Pastagem",
    arenoso: "Arenoso",
    misto: "Misto",
    argiloso: "Argiloso"
  };

  return mapa[texto] || texto;
}

carregarHistorico();
