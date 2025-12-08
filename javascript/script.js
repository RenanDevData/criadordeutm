// ===============================
// ELEMENTOS
// ===============================
const gerarUtmButton = document.querySelector('#gerarUTM');

// ===============================
// FUNÇÃO BASE PARA FORMATAR DATA
// ===============================
function formatarData() {
  const d = new Date();
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

const dataAtual = formatarData();

// ===============================
// NORMALIZAR CAMPOS UTM
// ===============================
function normalizarUtm(valor) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// ===============================
// COLORIR PARTES DA UTM PARA PREVIEW
// ===============================
function colorirUtmPreview(url) {
  try {
    const obj = new URL(url);

    let base = `<span style="color:#0a84ff; font-weight:bold;">${obj.origin}${obj.pathname}</span>`;
    let params = [];

    const cores = {
      utm_source: "#ff3b30",
      utm_medium: "#ff9500",
      utm_campaign: "#34c759",
      utm_term: "#af52de",
      utm_content: "#5ac8fa",
      utm_id: "#ffd60a",
      pmkt: "#ff2d55"
    };

    obj.searchParams.forEach((valor, chave) => {
      const cor = cores[chave] || "#ffffff";
      params.push(
        `<span style="color:${cor}; font-weight:bold;">${chave}=${valor}</span>`
      );
    });

    return `${base}?${params.join("&")}`;
  } catch {
    return url;
  }
}

// ===============================
// FUNÇÃO PURA PARA GERAR URL COM UTM
// ===============================
function criarUrlComUtm(baseUrl, campos) {
  if (!/^https?:\/\//i.test(baseUrl)) {
    baseUrl = "https://" + baseUrl;
  }

  const url = new URL(baseUrl);

  Object.entries(campos).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  return url.toString();
}

// ===============================
// GERAR UTM
// ===============================
function gerarUTM() {
  const baseUrls = Array.from({ length: 6 }, (_, i) =>
    document.getElementById(`baseUrl${i + 1}`).value.trim()
  ).filter(v => v !== "");

  const campos = {
    utm_id: normalizarUtm(document.getElementById('utm_id').value),
    utm_source: normalizarUtm(document.getElementById('utmSource').value),
    utm_medium: normalizarUtm(document.getElementById('utmMedium').value),
    utm_campaign: normalizarUtm(document.getElementById('utmCampaign').value),
    utm_term: normalizarUtm(document.getElementById('utmTerm').value),
    utm_content: normalizarUtm(document.getElementById('utmContent').value),
    pmkt: normalizarUtm(document.getElementById('pmkt').value)
  };

  if (!baseUrls.length || !campos.utm_source || !campos.utm_medium) {
    Swal.fire({
      title: 'Erro!',
      text: "Preencha pelo menos 1 URL + source + medium.",
      icon: 'error'
    });
    return;
  }

  const resultados = [];

  baseUrls.forEach(original => {
    try {
      const finalUrl = criarUrlComUtm(original, campos);
      resultados.push(finalUrl);
      salvarNoHistorico(finalUrl);
    } catch {
      resultados.push(`❌ URL inválida: ${original}`);
    }
  });

  Swal.fire({
    title: "Link(s) gerado com sucesso!",
    icon: 'success',
    timer: 1200,
    showConfirmButton: false
  });

  const outputDiv = document.getElementById('urlResultado');
  outputDiv.innerHTML = resultados.map(link => {
    const htmlColorido = colorirUtmPreview(link);

    return `
      <div class="link-item">
        <span class="link-copy" data-link="${link}" style="display:block; margin-bottom:4px;">
          ${htmlColorido}
        </span>
        <span class="copy-icon" data-link="${link}">📋</span>
      </div>
    `;
  }).join('');

  exibirHistorico();

  window.dataLayer = window.dataLayer || [];
  dataLayer.push({
    event: 'gerarUtm',
    quantidade: resultados.length
  });
}

// ===============================
// COPIAR TEXTO
// ===============================
function copiarTexto(texto) {
  navigator.clipboard.writeText(texto)
    .then(() => {
      Swal.fire({
        title: 'Copiado!',
        icon: 'success',
        timer: 1300,
        showConfirmButton: false
      });
    })
    .catch(() => {
      Swal.fire({
        title: 'Erro ao copiar',
        icon: 'error'
      });
    });
}

// ===============================
// HISTÓRICO
// ===============================
function salvarNoHistorico(link) {
  let historico = JSON.parse(localStorage.getItem('historicoUTM')) || [];

  if (!historico.some(item => item.link === link)) {
    historico.push({ data: dataAtual, link });
    localStorage.setItem('historicoUTM', JSON.stringify(historico));
  }
}

function exibirHistorico() {
  const historicoContainer = document.querySelector('.container-history');
  let historico = JSON.parse(localStorage.getItem('historicoUTM')) || [];

  historicoContainer.innerHTML = `
    <h2>Links criados</h2>
    <i class="fa-solid fa-file-excel excel_download"></i>
    <button id="limparHistorico">Limpar histórico</button>
  `;

  if (!historico.length) {
    historicoContainer.innerHTML += '<p class="alinhado">Sem links ainda.</p>';
    return;
  }

  historicoContainer.innerHTML += historico.reverse().map(item => `
    <div class="link-item">
      <span class="link-copy" data-link="${item.link}">${item.link}</span>
      <span class="copy-icon" data-link="${item.link}">📋</span>
      <a href="${item.link}" target="_blank">🔗</a>
    </div>
  `).join('');

  document.getElementById("limparHistorico").addEventListener("click", () => {
    Swal.fire({
      title: "Tem certeza?",
      text: "Isso vai apagar tudo.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim"
    }).then(res => {
      if (res.isConfirmed) {
        localStorage.removeItem('historicoUTM');
        exibirHistorico();
      }
    });
  });
}

// ===============================
// EXPORTAR CSV
// ===============================
function exportarParaCSV(dados, nomeDoArquivo) {
  if (!dados.length) return;

  const cabecalhos = Object.keys(dados[0]);
  const linhas = dados.map(obj =>
    cabecalhos.map(c => `"${String(obj[c]).replace(/"/g, '""')}"`).join(',')
  );

  const csv = [cabecalhos.join(','), ...linhas].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = nomeDoArquivo + ".csv";
  link.click();
}

// ===============================
// EVENTOS GERAIS
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  gerarUtmButton.addEventListener('click', gerarUTM);

  document.addEventListener('click', e => {
    if (e.target.dataset.link) {
      copiarTexto(e.target.dataset.link);
    }
  });

  document.body.addEventListener('click', e => {
    if (e.target.classList.contains('excel_download')) {
      const historico = JSON.parse(localStorage.getItem('historicoUTM')) || [];
      if (!historico.length) {
        Swal.fire({ title: 'Nada para exportar', icon: 'info' });
        return;
      }
      const data = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      exportarParaCSV(historico, `utm_${data}`);
      Swal.fire({ title: 'CSV baixado!', icon: 'success', timer: 1200, showConfirmButton: false });
    }
  });

  exibirHistorico();
});
