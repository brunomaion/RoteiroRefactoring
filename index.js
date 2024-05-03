const { readFileSync } = require("fs");

class Repositorio {
  constructor() {
    this.pecas = JSON.parse(readFileSync("./pecas.json"));
  }

  getPeca(apre) {
    return this.pecas[apre.id];
  }
}

class ServicoCalculoFatura {
  constructor(repo) {
    this.repo = repo;
  }

  calcularCredito(apresentacao) {
    let creditos = 0;
    creditos += Math.max(apresentacao.audiencia - 30, 0);
    if (this.repo.getPeca(apresentacao).tipo === "comedia")
      creditos += Math.floor(apresentacao.audiencia / 5);
    return creditos;
  }

  calcularTotalCreditos(apresentacoes) {
    let totalCreditos = 0;
    for (let apresentacao of apresentacoes) {
      totalCreditos += this.calcularCredito(apresentacao);
    }
    return totalCreditos;
  }

  calcularTotalApresentacao(apresentacao) {
    let total = 0;
    switch (this.repo.getPeca(apresentacao).tipo) {
      case "tragedia":
        total = 40000;
        if (apresentacao.audiencia > 30) {
          total += 1000 * (apresentacao.audiencia - 30);
        }
        break;
      case "comedia":
        total = 30000;
        if (apresentacao.audiencia > 20) {
          total += 10000 + 500 * (apresentacao.audiencia - 20);
        }
        total += 300 * apresentacao.audiencia;
        break;
      default:
        throw new Error(
          `Peça desconhecida: ${this.repo.getPeca(apresentacao).tipo}`
        );
    }
    return total;
  }

  calcularTotalFatura(apresentacoes) {
    let totalFatura = 0;
    for (let apresentacao of apresentacoes) {
      totalFatura += this.calcularTotalApresentacao(apresentacao);
    }
    return totalFatura;
  }
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(valor / 100);
}

function gerarFaturaStr(fatura, calc) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;

  for (let apresentacao of fatura.apresentacoes) {
    faturaStr += `  ${calc.repo.getPeca(apresentacao).nome}: ${formatarMoeda(
      calc.calcularTotalApresentacao(apresentacao)
    )} (${apresentacao.audiencia} assentos)\n`;
  }
  faturaStr += `Valor total: ${formatarMoeda(
    calc.calcularTotalFatura(fatura.apresentacoes)
  )}\n`;
  faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(
    fatura.apresentacoes
  )} \n`;
  return faturaStr;
}

/*
function gerarFaturaHTML(fatura, pecas) {
  const calc = new ServicoCalculoFatura(new Repositorio());
  let faturaHTML = `<html>\n<p> Fatura ${fatura.cliente} </p>\n<ul>\n`;

  for (let apresentacao of fatura.apresentacoes) {
    faturaHTML += `<li> ${calc.repo.getPeca(apresentacao).nome}: ${formatarMoeda(
      calc.calcularTotalApresentacao(apresentacao)
    )} (${apresentacao.audiencia} assentos) </li>\n`;
  }

  faturaHTML += `</ul>\n<p> Valor total: ${formatarMoeda(calc.calcularTotalFatura(fatura.apresentacoes))} </p>\n`;
  faturaHTML += `<p> Créditos acumulados: ${calc.calcularTotalCreditos(fatura.apresentacoes)} </p>\n</html>`;

  return faturaHTML;
}
*/

const faturas = JSON.parse(readFileSync("./faturas.json"));
const calc = new ServicoCalculoFatura(new Repositorio());
const faturaStr = gerarFaturaStr(faturas, calc);
console.log(faturaStr);

/*
const faturaHTML = gerarFaturaHTML(faturas, pecas);
console.log(faturaHTML);
*/