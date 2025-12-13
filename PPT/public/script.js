const socket = io();

let usuarioId = null;
let partidaId = null;

const txtUserId = document.getElementById('txtUserId');
const btnLogin = document.getElementById('btnLogin');
const cardLogin = document.querySelector('.card:nth-child(2)'); 
const menuAcciones = document.getElementById('menuAcciones');
const btnCrear = document.getElementById('btnCrearCPU');
const botonesJugada = document.querySelectorAll('.btn-jugada'); 

btnLogin.addEventListener('click', () => {
    const id = txtUserId.value;
    if (!id) return alert("Introduce un ID válido");

    usuarioId = parseInt(id);
    console.log(`Usuario logueado: ${usuarioId}`);

    cardLogin.classList.add('hidden');
    menuAcciones.classList.remove('hidden');
});

btnCrear.addEventListener('click', async () => {
    if (!usuarioId) return alert("Debes identificarte primero");

    try {
        const resp = await fetch('/api/partidas/crear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_usuario: usuarioId,
                contra_maquina: true 
            })
        });

        const data = await resp.json();

        if (resp.ok) {
            console.log('Partida creada:', data);
            partidaId = data.partida.id; 
            
            lblPartidaId.textContent = partidaId;
            menuAcciones.classList.add('hidden');
            tableroJuego.classList.remove('hidden');
            mostrarMensaje(`Partida ${partidaId} creada. ¡Haz tu jugada!`);
        } else {
            mostrarMensaje(data.msg || 'Error al crear partida');
        }

    } catch (error) {
        console.error(error);
        mostrarMensaje('Error de conexión con el servidor');
    }
});

btnUnirse.addEventListener('click', async () => {
    if (!usuarioId) return mostrarMensaje("Debes identificarte primero");
    
    const idParaUnirse = txtPartidaId.value;
    if (!idParaUnirse) return mostrarMensaje("Introduce el ID de la partida");

    try {
        const resp = await fetch('/api/partidas/unirse', {
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_partida: idParaUnirse,
                id_usuario: usuarioId
            })
        });

        const data = await resp.json();

        if (resp.ok) {
            console.log('Te has unido:', data);
            partidaId = data.partida.id;
            
            lblPartidaId.textContent = partidaId;
            menuAcciones.classList.add('hidden');
            tableroJuego.classList.remove('hidden');
            mostrarMensaje(`¡Unido a la partida ${partidaId}! A jugar.`);
            
        } else {
            mostrarMensaje(data.msg || 'Error al unirse');
        }

    } catch (error) {
        console.error(error);
        mostrarMensaje('Error de conexión');
    }
});

botonesJugada.forEach( boton => {
    boton.addEventListener('click', () => {
        
        if (!usuarioId) return mostrarMensaje("Debes identificarte primero.");
        if (!partidaId) return mostrarMensaje("No estás en ninguna partida.");

        const jugadaElegida = boton.getAttribute('data-jugada');

        socket.emit('hacer-jugada', {
            id_partida: partidaId,
            id_usuario: usuarioId,
            jugada: jugadaElegida
        });

        mostrarMensaje(`Has lanzado: ${jugadaElegida}. Esperando al servidor...`);
    });
});

socket.on('error-jugada', (data) => {
    mostrarMensaje(`❌ Error: ${data.msg}`);
});

socket.on('resultado-ronda', (data) => {
    if (data.id_partida !== partidaId) return;

    console.log('Resultado ronda:', data);

    if (lblMarcador) {
        lblMarcador.textContent = `${data.marcador.j1} - ${data.marcador.j2}`;
    }

    let mensaje = `Ronda finalizada. J1: ${data.jugadas.j1} vs J2: ${data.jugadas.j2}. `;
    
    if (data.ganador === 'empate') {
        mensaje += "¡Es un EMPATE!";
    } else if (data.ganador == usuarioId) {
        mensaje += "¡GANASTE la ronda! 🎉";
    } else {
        mensaje += "Perdiste la ronda... 😢";
    }

    mostrarMensaje(mensaje);
});

function conectarWSSala(id) {
    if (socket) {
        socket.emit('unirse-sala', id);
    }
}

function mostrarMensaje(msg) {
    if(alertas) alertas.textContent = msg;
    console.log(msg);
}