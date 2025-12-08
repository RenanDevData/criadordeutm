const gerarUtmButton = document.querySelector('#gerarUTM');
const dataAtual = formatarData()




function gerarUTM() {
  const baseUrls = [
    document.getElementById('baseUrl1').value.trim(),
    document.getElementById('baseUrl2').value.trim(),
    document.getElementById('baseUrl3').value.trim(),
    document.getElementById('baseUrl4').value.trim(),
    document.getElementById('baseUrl5').value.trim(),
    document.getElementById('baseUrl6').value.trim()
  ].filter(url => url !== "");

  const campaignId = document.getElementById('utm_id').value.trim().toLowerCase();
  const source = document.getElementById('utmSource').value.trim().toLowerCase();
  const medium = document.getElementById('utmMedium').value.trim().toLowerCase();
  const campaign = document.getElementById('utmCampaign').value.trim().toLowerCase();
  const term = document.getElementById('utmTerm').value.trim().toLowerCase();
  const content = document.getElementById('utmContent').value.trim().toLowerCase();
  const pmkt = document.getElementById('pmkt').value;

  console.log(campaignId,source,medium,campaign, term,content)

  if (baseUrls.length === 0 || !source || !medium) {
    Swal.fire({
      title: 'Erro!',
      text: "Preencha pelo menos uma URL base + os campos obrigatórios: source e medium.",
      icon: 'error',
      confirmButtonText: 'OK'
    });
    return;
  }

  const resultados = [];

  for (let originalUrl of baseUrls) {
    let baseUrl = originalUrl;

    // Adiciona https:// se estiver faltando
    if (!/^https?:\/\//i.test(baseUrl)) {
      baseUrl = 'https://' + baseUrl;
    }

    try {
      const url = new URL(baseUrl);

      if (campaignId) url.searchParams.set('utm_id', campaignId);
      url.searchParams.set('utm_source', source);
      url.searchParams.set('utm_medium', medium);
      if (campaign) url.searchParams.set('utm_campaign', campaign);
      if (term) url.searchParams.set('utm_term', term);
      if (content) url.searchParams.set('utm_content', content);
      if (pmkt) url.searchParams.set('pmkt', pmkt);

      const finalUrl = url.toString();
      console.log(finalUrl)
  
      resultados.push(finalUrl);
      salvarNoHistorico(finalUrl);
    } catch (error) {
      resultados.push(`❌ URL inválida: ${originalUrl}`);
    }
  }

       Swal.fire({
  title: "Link(s) gerado com sucesso!",
  icon: 'success',
  timer: 1300,
 showConfirmButton: false,
  showClass: {
    popup: `
      animate__animated
      animate__fadeInUp
      animate__faster
    `
  },
  hideClass: {
    popup: `
      animate__animated
      animate__fadeOutDown
      animate__faster
    `
  }
});

  // Swal.fire({
  //   title: 'Link(s) gerado com sucesso!',
  //   icon: 'success',
  //   timer: 2000,
  //   showConfirmButton: false
  // });

  const outputDiv = document.getElementById('urlResultado');
  outputDiv.innerHTML = resultados.map(link => `
    <div class="link-item">
      <span class="link-copy">${link}</span>
      <span class="copy-icon" data-link="${link}" title="Copiar">📋</span>
    </div>
  `).join('');

  exibirHistorico();
  window.dataLayer = window.dataLayer || [];
  dataLayer.push({
    event: 'gerarUtm', 
    url: outputDiv
  })
}

// Copiar link ao clicar
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('link-copy') || e.target.classList.contains('copy-icon')) {
    const texto = e.target.dataset.link || e.target.textContent;
    copiarTexto(texto);
  }
});

function copiarTexto(texto) {
  navigator.clipboard.writeText(texto)
    .then(() => {

      Swal.fire({
        title: 'Copiado!',
        text: 'A URL foi copiada para a área de transferência.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        showClass: {
    popup: `
      animate__animated
      animate__fadeInUp
      animate__faster
    `
  },
  hideClass: {
    popup: `
      animate__animated
      animate__fadeOutDown
      animate__faster
    `
  }
      });
    })
    .catch(() => {
      Swal.fire({
        title: 'Erro',
        text: 'Não foi possível copiar.',
        icon: 'error',
        showClass: {
    popup: `
      animate__animated
      animate__fadeInUp
      animate__faster
    `
  },
  hideClass: {
    popup: `
      animate__animated
      animate__fadeOutDown
      animate__faster
    `
  }
      });
    });
}

function formatarData(){
const dateDeHoje = new Date()
const dia = dateDeHoje.getDate();
const mes = dateDeHoje.getMonth()
const ano = dateDeHoje.getFullYear()
const diaFormatado = dia
const mesFormatado = mes + 1
const dataFormatada = `${diaFormatado}/${mesFormatado}/${ano}`;
return dataFormatada
}



function salvarNoHistorico(link) {
    // Função auxiliar para gerar a data no formato dd/mm/yyyy
  
    let historico = JSON.parse(localStorage.getItem('historicoUTM')) || [];

   
    const linkJaExiste = historico.some(item => item.link === link);

    if (!linkJaExiste) {
        // 3. Cria um novo objeto com data e link
        const novoRegistro = {
            data: dataAtual,
            link: link
        };

        historico.push(novoRegistro);

        // 5. Salva o array atualizado no localStorage
        console.log(historico);
        localStorage.setItem('historicoUTM', JSON.stringify(historico));
    }
}



// function salvarNoHistorico(link) {
//   let historico = JSON.parse(localStorage.getItem('historicoUTM')) || [];

//   if (!historico.includes(link)) {
//     historico.push(dataAtual, link);
//     console.log(historico)
//     localStorage.setItem('historicoUTM', JSON.stringify(historico));
//   }
// }

function exibirHistorico() {
  const historicoContainer = document.querySelector('.container-history');
  const historico = JSON.parse(localStorage.getItem('historicoUTM')) || [];

  historicoContainer.innerHTML = `
    <h2>Links criados</h2> 
    <div class="exportar">
    <i class="fa-solid fa-file-excel excel_download exportar"></i> 
    </div>
    <button id="limparHistorico">Limpar histórico</button>
  `;

  if (historico.length === 0) {
    historicoContainer.innerHTML += '<p class="alinhado">Sem links no histórico ainda.</p>';
  } else {
    const lista = historico.reverse().map(link => `
      <div class="link-item">
        <span class="link-copy">${link.link}</span>
        <span class="copy-icon" data-link="${link}" title="Copiar">📋</span>
        <a  class="acessar" href="${link.link}" title="Acessar" target="_blank" rel="noopener noreferrer">🔗</a>
      </div>
    `).join('');
    historicoContainer.innerHTML += lista;
  }

  ativarBotaoLimpar(); // Reaplica o listener ao botão recriado
}

function ativarBotaoLimpar() {
  const btnLimpar = document.getElementById('limparHistorico');
  if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
      Swal.fire({
        title: 'Tem certeza?',
        text: "Isso vai apagar todos os links salvos.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e20c0cff',
        confirmButtonText: 'Sim, apagar',
        cancelButtonText: 'Cancelar',
        showClass: {
    popup: `
      animate__animated
      animate__fadeInUp
      animate__faster
    `
  },
  hideClass: {
    popup: `
      animate__animated
      animate__fadeOutDown
      animate__faster
    `
  }
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem('historicoUTM');
          exibirHistorico();
        }
      });
    });
  }
}

// Inicializa o app
document.addEventListener('DOMContentLoaded', () => {
  gerarUtmButton.addEventListener('click', gerarUTM);
  exibirHistorico();
});





 function exportarParaCSV(dados, nomeDoArquivo) {
    if (!dados || dados.length === 0) {
        console.warn("Nenhum dado fornecido para exportação.");
        return;
    }

    // 1. EXTRAIR CABEÇALHOS
    // Usa as chaves do primeiro objeto para obter os cabeçalhos das colunas
    const cabecalhos = Object.keys(dados[0]);
    
    // Converte os cabeçalhos em uma linha CSV
    const linhaCabecalhos = cabecalhos.join(',');

    // 2. EXTRAIR DADOS (CONVERTER LINHAS)
    const linhasCSV = dados.map(obj => {
        // Para cada objeto, mapeia os valores correspondentes aos cabeçalhos
        return cabecalhos.map(chave => {
            let valor = obj[chave];
            
            // Tratamento: Garante que strings com vírgulas ou aspas sejam encapsuladas
            // Isso previne que vírgulas dentro do texto quebrem as colunas.
            if (typeof valor === 'string' && (valor.includes(',') || valor.includes('"') || valor.includes('\n'))) {
                // Substitui aspas duplas por duas aspas duplas e envolve o valor em aspas
                valor = `"${valor.replace(/"/g, '""')}"`;
            }
            // Converte valores booleanos para texto
            if (typeof valor === 'boolean') {
                valor = valor ? 'Verdadeiro' : 'Falso';
            }
            
            return valor;
        }).join(',');
    });

    // 3. CONCATENAR TUDO
    // Junta a linha de cabeçalho com todas as linhas de dados, separadas por quebra de linha
    const conteudoCSV = [linhaCabecalhos, ...linhasCSV].join('\n');

    // 4. CRIAR E BAIXAR O ARQUIVO
    // Cria um Blob (objeto binário) a partir da string CSV
    // Usamos 'text/csv;charset=utf-8' para garantir que caracteres especiais funcionem
    const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
    
    // Cria um link temporário para iniciar o download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', nomeDoArquivo + '.csv'); // Define o nome do arquivo
    
    // Dispara o clique no link e remove-o
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// const excelButton = document.querySelector('.excel_download')


// document.addEventListener('DOMContentLoaded', function(){

// excelButton.addEventListener('click', function(){
//    const historicoGeral = JSON.parse(localStorage.getItem('historicoUTM')) || []
//  exportarParaCSV(historicoGeral,"teste_excel")
// })

// })






document.addEventListener('DOMContentLoaded', () => {
    // ... seu código existente para gerarUtmButton e exibirHistorico ...
    gerarUtmButton.addEventListener('click', gerarUTM);
    exibirHistorico();

    // DELEGAÇÃO DE EVENTOS para o botão de exportar
    document.body.addEventListener('click', function(e) {
        // Verifica se o clique ocorreu no ícone de exportação
        if (e.target.classList.contains('excel_download')) {
            const historicoGeral = JSON.parse(localStorage.getItem('historicoUTM')) || [];
            
            if (historicoGeral.length > 0) {
                const dataFormatada = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                exportarParaCSV(historicoGeral, `links_utm_${dataFormatada}`);
                
                Swal.fire({
                    title: 'Download CSV Concluido',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                 });
            } else {
                 Swal.fire({
                    title: 'Histórico Vazio',
                    text: "Não há links para exportar.",
                    icon: 'info'
                 });
            }
        }
    });
});

