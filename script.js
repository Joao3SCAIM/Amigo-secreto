let participantes = [];
let resultados = {};
let fotos = {};  // Armazenará as fotos associadas a cada participante

function adicionarParticipante() {
    const nome = document.getElementById("nome").value.trim();
    const fotoInput = document.getElementById("foto");
    const foto = fotoInput.files[0];  // Pega o arquivo da foto

    if (nome && foto && !participantes.includes(nome)) {
        participantes.push(nome);
        fotos[nome] = foto;  // Armazena a foto associada ao nome
        document.getElementById("nome").value = "";  // Limpa o campo de nome
        fotoInput.value = "";  // Limpa o campo de foto
        atualizarLista();
    } else {
        alert("Digite um nome válido e selecione uma foto.");
    }
}

function atualizarLista() {
    const lista = document.getElementById("lista-participantes");
    lista.innerHTML = "";  // Limpa a lista
    participantes.forEach(nome => {
        const li = document.createElement("li");
        li.innerHTML = `${nome} <input type="file" onchange="atualizarFoto('${nome}', this)" accept="image/*" />`;
        lista.appendChild(li);
    });
}

function atualizarFoto(nome, input) {
    const foto = input.files[0];  // Pega a nova foto
    if (foto) {
        fotos[nome] = foto;  // Atualiza a foto do participante
    }
}

function sorteio() {
    if (participantes.length < 2) {
        alert("Precisa ter pelo menos 2 participantes para realizar o sorteio.");
        return;
    }

    let participantesSorteados = [...participantes];
    resultados = {};  // Reseta os resultados anteriores

    // Realiza o sorteio, evitando que alguém tire a si mesmo
    for (let i = 0; i < participantes.length; i++) {
        let sorteado;
        do {
            sorteado = participantesSorteados.splice(Math.floor(Math.random() * participantesSorteados.length), 1)[0];
        } while (sorteado === participantes[i]);  // Garante que não tirem a si mesmos

        resultados[participantes[i]] = sorteado;
    }

    gerarPDFs(resultados);  // Gera e baixa todos os PDFs após o sorteio
}

async function gerarPDFs(resultados) {
    const { jsPDF } = window.jspdf;

    // Cria o PDF para cada participante
    for (let nome in resultados) {
        const amigoSecreto = resultados[nome];
        const foto = fotos[amigoSecreto];

        if (!foto) {
            alert(`Foto do participante ${amigoSecreto} não encontrada!`);
            continue;  // Se não encontrar foto, ignora e vai para o próximo
        }

        const reader = new FileReader();

        reader.onload = function(e) {
            const imgData = e.target.result;
            const doc = new jsPDF();

            try {
                // Tenta adicionar a foto ao PDF
                const fotoWidth = 180; // Largura da foto
                const fotoHeight = 180; // Altura da foto
                const xPos = (doc.internal.pageSize.width - fotoWidth) / 2; // Centraliza a foto
                const yPos = 20; // Posição vertical da foto
                doc.addImage(imgData, "JPEG", xPos, yPos, fotoWidth, fotoHeight); // Adiciona a foto

                // Adiciona o nome e a mensagem no PDF
                doc.setFont("helvetica", "bold");
                doc.setFontSize(24);
                const nomeWidth = doc.getStringUnitWidth(nome) * doc.getFontSize() / doc.internal.scaleFactor; // Largura do nome
                const nomeX = (doc.internal.pageSize.width - nomeWidth) / 2; // Centraliza o nome
                doc.text(nome, nomeX, yPos + fotoHeight + 10);  // Coloca o nome abaixo da foto

                doc.setFontSize(16);
                const texto = `Você tirou: ${amigoSecreto}`;
                const textoWidth = doc.getStringUnitWidth(texto) * doc.getFontSize() / doc.internal.scaleFactor; // Largura do texto
                const textoX = (doc.internal.pageSize.width - textoWidth) / 2; // Centraliza o texto
                doc.text(texto, textoX, yPos + fotoHeight + 40);  // Coloca o texto abaixo do nome

                // Salva o PDF com o nome do participante
                doc.save(`${nome}_Amigo_Secreto.pdf`);
            } catch (err) {
                console.error("Erro ao gerar o PDF:", err);
                alert("Houve um erro ao tentar gerar o PDF para " + nome);
            }
        };

        // Verifica se a foto está no formato correto antes de tentar ler
        if (foto.type.startsWith("image/")) {
            reader.readAsDataURL(foto);  // Lê a foto e gera o PDF
        } else {
            alert("Formato de foto inválido para " + amigoSecreto + ". Por favor, selecione uma imagem.");
        }
    }
}
