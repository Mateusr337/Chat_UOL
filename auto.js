let data = new Date();
let hora = ("0" + data.getHours()).slice(-2);
let min = ("0" + data.getMinutes()).slice(-2);
let seg = ("0" + data.getSeconds()).slice(-2);

let legendaMensagem = document.querySelector('.mensagemEnviar');
let nome = "";
const main = document.querySelector('main');
let time = hora + ":" + min + ":" + seg;


function verificarNomeEntrada() {
    nome = document.querySelector('.iniciar .inputTexto');
    const promessa = axios.post('https://mock-api.driven.com.br/api/v4/uol/participants', { name: nome.value, time, type: "status" });

    const img = document.querySelector('.iniciar .carregandoimg');
    img.classList.remove('sumir');

    promessa.then(chamarMensagens);
    promessa.catch(PedirNomeNovamente);
}


function PedirNomeNovamente() {
    let aviso = document.querySelector('.iniciar .aviso');
    nome.value = "";
    aviso.innerHTML = "Insira outro nome, este já esta em uso!"
    const img = document.querySelector('.iniciar .carregandoimg');
    img.classList.add('sumir');
}

let online = false;
function chamarMensagens() {
    const promessa = axios.get('https://mock-api.driven.com.br/api/v4/uol/messages'); //buscando mensagens
    promessa.then(carregarMensagem);
    promessa.catch(ErroCarregarMensagem);
}

function ErroCarregarMensagem(resposta) {
    window.location.reload();
}

let ultimaMensagem;
function carregarMensagem(resposta) {
    console.log(resposta);
    if (online && ultimaMensagem.time === resposta.data[99].time) {
        return;
    }
    document.querySelector('article').style.display = "none";
    main.innerHTML = "";

    for (let i = 0; i < resposta.data.length; i++) {
        if (resposta.data[i].type === "status") {
            main.innerHTML += (`<section data-identifier="message" class="entrouSaiu"><span class="time">${resposta.data[i].time}</span> <span class="from">${resposta.data[i].from}</span> <span class="text">${resposta.data[i].text}</span> </section>`)
        } else if (resposta.data[i].type === "message") {
            main.innerHTML += (`<section data-identifier="message" class="mensagem"><span class="time">${resposta.data[i].time}</span> <span class="from">${resposta.data[i].from}</span> para <span class="to">${resposta.data[i].to}:</span> <span class="text">${resposta.data[i].text}</span> </section>`)
        } else if (resposta.data[i].type === "private_message" && (resposta.data[i].to === nome.value || resposta.data[i].from === nome.value)) {
            main.innerHTML += (`<section data-identifier="message" class="reservado"><span class="time">${resposta.data[i].time}</span> <span class="from">${resposta.data[i].from}</span> para <span class="to">${resposta.data[i].to}:</span> <span class="text">${resposta.data[i].text}</span> </section>`)
        }
    }
    let mensagens = document.querySelector('section:last-child');
    mensagens.scrollIntoView();
    ultimaMensagem = resposta.data[99];

    if (!online) {
        setInterval(chamarMensagens, 3000);
        setInterval(atualizarOnline, 3000);
        setInterval(buscarConectados, 3000);
        online = true;
    }
}

function atualizarOnline() {
    const promessa = axios.post('https://mock-api.driven.com.br/api/v4/uol/status', { name: nome.value });
    promessa.catch(ErroCarregarMensagem);
}

function enviarMensagem() {
    let texto = document.querySelector('.enviar input');
    const tipoMensagem = document.querySelector('.barraLateral .selecionadoTipoMensagem');
    const usuario = document.querySelector('.barraLateral .selecionadoUsuario span');

    if (tipoMensagem.classList.contains('publico')) {
        main.innerHTML += `<section data-identifier="message" class="mensagem"><span class="time">${time}</span> <span class="from">${nome.value}</span> para <span class="to">Todos:</span> <span class="text">${texto.value}</span> </section>`;
        const promessa = axios.post('https://mock-api.driven.com.br/api/v4/uol/messages', { from: nome.value, to: "Todos", text: texto.value, type: "message" });
        texto.value = "";
        promessa.catch(ErroCarregarMensagem);
    }
    else if (tipoMensagem.classList.contains('reservadamente') && usuario !== null) {
        main.innerHTML += `<section data-identifier="message" class="reservado"><span class="time">${time}</span> <span class="from">${nome.value}</span> para <span class="to">${usuario.innerHTML}</span> <span class="text">${texto.value}</span> </section>`;
        const promessa = axios.post('https://mock-api.driven.com.br/api/v4/uol/messages', { from: nome.value, to: usuario.innerHTML, text: texto.value, type: "private_message" });
        texto.value = "";
        promessa.catch(ErroCarregarMensagem);
    }
}

function aparecerLateral() {
    const lateral = document.querySelector("aside");
    lateral.classList.toggle('sumir');
}

function buscarConectados() {
    let promessa = axios.get('https://mock-api.driven.com.br/api/v4/uol/participants');
    promessa.then(conectados);
    promessa.catch(ErroCarregarMensagem);
}
function conectados(resposta) {
    let usuarioSelecionado = document.querySelector('.selecionadoUsuario span');
    let caixaMembros = document.querySelector('.membros .usuarios');
    caixaMembros.innerHTML = "";
    if (usuarioSelecionado.innerHTML === "Todos") {
        caixaMembros.innerHTML = `<div class="pessoa selecionadoUsuario">
        <ion-icon name="people"></ion-icon><span>Todos</span><div class="check">
        <ion-icon name="checkmark"></ion-icon></div></div>`;
    } else {
        caixaMembros.innerHTML = `<div class="pessoa">
        <ion-icon name="people"></ion-icon><span>Todos</span><div class="check">
        <ion-icon name="checkmark"></ion-icon></div></div>`;
    }
    for (let i = 0; i < resposta.data.length; i++) {
        if (resposta.data[i].name === usuarioSelecionado.innerHTML) {
            caixaMembros.innerHTML += `<div class="pessoa selecionadoUsuario data-identifier="participant"" onclick="selecionarUsuario(this)">
            <ion-icon name="person-circle"></ion-icon><span>${resposta.data[i].name}</span><div class="check"><ion-icon name="checkmark"></ion-icon></div>
            </div>`;
        } else {
            caixaMembros.innerHTML += `<div class="pessoa data-identifier="participant"" onclick="selecionarUsuario(this)">
            <ion-icon name="person-circle"></ion-icon><span>${resposta.data[i].name}</span><div class="check"><ion-icon name="checkmark"></ion-icon></div>
            </div>`;
        }
    }
}

function selecionarUsuario(usuario) {
    const usuarioSelecionado = document.querySelector('.selecionadoUsuario');
    usuarioSelecionado.classList.remove('selecionadoUsuario');
    usuario.classList.add('selecionadoUsuario');
    verificarTipoMensagem();
}
function selecionarTipo(tipo) {
    const tipoSelecionado = document.querySelector('.selecionadoTipoMensagem');
    tipoSelecionado.classList.remove('selecionadoTipoMensagem');
    tipo.classList.add('selecionadoTipoMensagem');
    verificarTipoMensagem();
}
function verificarTipoMensagem() {
    const nomePrivado = document.querySelector('.selecionadoUsuario span');
    const tipo = document.querySelector('.selecionadoTipoMensagem');
    if (tipo.classList.contains('reservadamente')) {
        legendaMensagem.innerHTML = `Enviar para ${nomePrivado.innerHTML} (reservadamente)`;
    } else {
        legendaMensagem.innerHTML = "";
    }
}

document.addEventListener('keypress', function (e) {
    if (e.key === "Enter" && online === false) {
        const botao = document.querySelector('.botao_iniciar');
        botao.click();
    } else if (e.key === "Enter" && online === true) {
        const botao = document.querySelector('.enviarmensagemchat');
        botao.click();
    }
});
