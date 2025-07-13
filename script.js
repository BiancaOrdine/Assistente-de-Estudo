// Modo Escuro
const themeSwitch = document.getElementById('theme-switch');
    const icon = themeSwitch.querySelector('i');

    themeSwitch.addEventListener('click', () => {
      document.body.classList.toggle('darkmode');
      if (document.body.classList.contains('darkmode')) {
        icon.classList.replace('fa-moon', 'fa-sun');
      } else {
        icon.classList.replace('fa-sun', 'fa-moon');
      }
    });

// Menu mobile
const menu = document.querySelector(".menu");
const nav = document.querySelector(".nav");

menu.addEventListener("click", () => {
    nav.classList.toggle("active");
});

window.addEventListener('scroll', () => {
    if (nav.classList.contains('active')) {
        nav.classList.remove('active');
    }
});

// Código Gemini AI 
const apiKeyInput = document.getElementById('apiKey');
const materiaSelect = document.getElementById('materiaSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const aiResponse = document.getElementById('aiResponse');
const form = document.getElementById('form');


const markdownToHTML = (text) => {
    const converter = new showdown.Converter();
    return converter.makeHtml(text);
};

const perguntarAI = async (question, materia, apiKey) => {
    const model = 'gemini-2.0-flash';
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const hoje = new Date().toLocaleDateString('pt-BR');

    const promptMatematica = `
## Especialidade
Você é um matemático altamente qualificado, com profundo conhecimento em álgebra, cálculo, estatística, geometria analítica e teoria dos números.

## Tarefa
Forneça respostas rigorosas, precisas e claras, explicando conceitos matemáticos passo a passo.

## Regras
- Não invente respostas; use apenas conhecimento validado.
- Se não souber, responda "Não sei".
- Responda somente perguntas de matemática.
- Data atual: ${hoje}.
- Limite a resposta a 300 caracteres, mas seja completo.

## Resposta
- Use Markdown para fórmulas (\\( ... \\)).
- Explique termos técnicos brevemente.
- Sem saudações ou despedidas.

Pergunta: ${question}
`;

    const promptPortugues = `
## Especialidade
Você é um linguista e professor de língua portuguesa, especialista em gramática normativa, análise sintática, morfologia, semântica e interpretação de textos.

## Tarefa
Forneça respostas claras e detalhadas sobre português, com exemplos quando necessário.

## Regras
- Não invente respostas.
- Responda somente perguntas de língua portuguesa.
- Se não souber, responda "Não sei".
- Data atual: ${hoje}.
- Limite a resposta a 300 caracteres, mantendo completude.

## Resposta
- Use Markdown para destacar termos e exemplos.
- Explique conceitos técnicos de forma simples.
- Sem cumprimentos ou despedidas.

Pergunta: ${question}
`;

    let prompt;
    if (materia === 'Matematica') {
        prompt = promptMatematica;
    } else if (materia === 'Portugues') {
        prompt = promptPortugues;
    } else {
        throw new Error('Matéria não reconhecida');
    }

    const body = {
        contents: [
            {
                role: 'user',
                parts: [{ text: prompt }]
            }
        ],
    };

    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const msg = await response.text();
        throw new Error(`Erro da API (${response.status}): ${msg}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta.';
};

const enviarFormulario = async (event) => {
    event.preventDefault();

    const apiKey = apiKeyInput.value.trim();
    const materia = materiaSelect.value;
    const pergunta = questionInput.value.trim();

    if (!apiKey || !materia || !pergunta) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    askButton.disabled = true;
    askButton.textContent = 'Perguntando…';
    askButton.classList.add('loading');

    try {
        const respostaMarkdown = await perguntarAI(pergunta, materia, apiKey);
        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(respostaMarkdown);
        aiResponse.classList.remove('hidden');
    } catch (error) {
        console.error(error);
        alert(error.message);
    } finally {
        askButton.disabled = false;
        askButton.textContent = 'Perguntar';
        askButton.classList.remove('loading');
    }
};

form.addEventListener('submit', enviarFormulario);
