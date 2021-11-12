let data = new Date();
let hora = ("0" + data.getHours()).slice(-2);
let min = ("0" + data.getMinutes()).slice(-2);
let seg = ("0" + data.getSeconds()).slice(-2);

let nome;
let time = hora + ":" + min + ":" + seg;


function verificarNomeEntrada() {
    nome = document.querySelector('.iniciar input');
    const promessa = axios.post('https://mock-api.driven.com.br/api/v4/uol/participants', { name: nome.value, time, type: "status" });
    promessa.then(chamarMensagens);
    promessa.catch(PedirNomeNovamente);
}

function PedirNomeNovamente() {
    let aviso = document.querySelector('.iniciar .aviso');
    nome.value = "";
    aviso.innerHTML = "Insira outro nome, este já esta em uso!"
}

let online = false;
function chamarMensagens() {
    if (!online) {
        const promessa = axios.get('https://mock-api.driven.com.br/api/v4/uol/messages'); //buscando mensagens
        promessa.then(carregarMensagem);
        online = true;
    } else {
        const promessa = axios.get('https://mock-api.driven.com.br/api/v4/uol/messages'); //buscando mensagens
        promessa.then(recarregarMensagem);
    }
}
let atualizarMensagem;
let atualizarStatus;

function carregarMensagem(resposta) {
    const main = document.querySelector('main');
    document.querySelector('article').style.display = "none";
    console.log(resposta);

    for (let i = 0; i < resposta.data.length; i++) {

        if (resposta.data[i].type === "status") {
            main.innerHTML += (`<section class="entrouSaiu"><span class="time">${resposta.data[i].time}</span> <span class="from">${resposta.data[i].from}</span> <span class="text">${resposta.data[i].text}</span> </section>`)
        } else if (resposta.data[i].type === "message") {
            main.innerHTML += (`<section class="mensagem"><span class="time">${resposta.data[i].time}</span> <span class="from">${resposta.data[i].from}</span> para <span class="to">${resposta.data[i].to}:</span> <span class="text">${resposta.data[i].text}</span> </section>`)
        } else if (resposta.data[i].type === "reservadas" && resposta.data[i].to === nome) {
            main.innerHTML += (`<section class="reservado"><span class="time">${resposta.data[i].time}</span> <span class="from">${resposta.data[i].from}</span> para <span class="to">${resposta.data[i].to}:</span> <span class="text">${resposta.data[i].text}</span> </section>`)
        }
    }
    let mensagens = document.querySelector('section:last-child');
    mensagens.scrollIntoView();

    setInterval(chamarMensagens, 3000);
    setInterval(atualizarOnline, 5000);
}
function recarregarMensagem(resposta) {
    const main = document.querySelector('main');
    main.innerHTML = "";
    console.log(resposta);

    for (let i = 0; i < resposta.data.length; i++) {

        if (resposta.data[i].type === "status") {
            main.innerHTML += (`<section class="entrouSaiu"><span class="time">${resposta.data[i].time}</span> <span class="from">${resposta.data[i].from}</span> <span class="text">${resposta.data[i].text}</span> </section>`);
        } else if (resposta.data[i].type === "message") {
            main.innerHTML += (`<section class="mensagem"><span class="time">${resposta.data[i].time}</span> <span class="from">${resposta.data[i].from}</span> para <span class="to">${resposta.data[i].to}:</span> <span class="text">${resposta.data[i].text}</span> </section>`);
        } else if (resposta.data[i].type === "private_message" && resposta.data[i].to === nome.value) {
            main.innerHTML += (`<section class="reservado"><span class="time">${resposta.data[i].time}</span> <span class="from">${resposta.data[i].from}</span> para <span class="to">${resposta.data[i].to}:</span> <span class="text">${resposta.data[i].text}</span> </section>`);
        }
    }
    let mensagens = document.querySelector('section:last-child');
    mensagens.scrollIntoView();
}

function atualizarOnline() {
    axios.post('https://mock-api.driven.com.br/api/v4/uol/status', { name: nome.value });
}

function enviarMensagem() {
    const main = document.querySelector('main');
    let texto = document.querySelector('.enviar input');

    axios.post('https://mock-api.driven.com.br/api/v4/uol/messages', { from: nome.value, text: texto.value, time, to: "Todos", type: "message" });
    texto.value = ""

    main.innerHTML += '<section class="mensagem"><span class="time">${time}</span> <span class="from">${nome.value}</span> para <span class="to">Todos:</span> <span class="text">${texto.value}</span> </section>';
}
