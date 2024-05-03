const { readFileSync } = require('fs');
const { get } = require('http');

function gerarFaturaStr(fatura) {
  let totalFatura = 0;
  let creditos = 0;
  let faturaStr = `Fatura ${fatura.cliente}\n`;

  for (let apre of fatura.apresentacoes) {
    //const peca = getPeca(apre);

    let total = calcularTotalApresentacao(apre);
    creditos = calcularCredito(apre);

    // mais uma linha da fatura
    faturaStr += `  ${getPeca(apre).nome}: ${formatarMoeda(total / 100)} (${apre.audiencia} assentos)\n`;
    totalFatura += total;
  }

  faturaStr += `Valor total: ${formatarMoeda(totalFatura / 100)}\n`;
  faturaStr += `Créditos acumulados: ${creditos} \n`;

  return faturaStr;
}

// função extraída
function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR",
    {
      style: "currency", currency: "BRL",
      minimumFractionDigits: 2
    }).format(valor / 100);
}

function calcularTotalApresentacao(apre) {
  let total = 0;

  switch (getPeca(apre).tipo) {
    case "tragedia":
      total = 40000;
      if (apre.audiencia > 30) {
        total += 1000 * (apre.audiencia - 30);
      }
      break;
    case "comedia":
      total = 30000;
      if (apre.audiencia > 20) {
        total += 10000 + 500 * (apre.audiencia - 20);
      }
      total += 300 * apre.audiencia;
      break;
    default:
      throw new Error(`Peça desconhecia: ${getPeca(apre).tipo}`);
  }

  return total;
}

// funcao query
function getPeca(apresentacao) {
  return pecas[apresentacao.id];
}

// função extraída
function calcularCredito(apre) {
  let creditos = 0;
  creditos += Math.max(apre.audiencia - 30, 0);
  if (getPeca(apre).tipo === "comedia")
    creditos += Math.floor(apre.audiencia / 5);
  return creditos;
}

const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
const faturaStr = gerarFaturaStr(faturas, pecas);
console.log(faturaStr);