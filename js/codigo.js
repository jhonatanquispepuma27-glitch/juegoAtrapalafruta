const canvas = document.getElementById("juego");
const ctx = canvas.getContext("2d");

const puntosHTML = document.getElementById("puntos");
const vidasHTML = document.getElementById("vidas");
const tiempoHTML = document.getElementById("tiempo");
const mensajeHTML = document.getElementById("mensaje");

const botonIniciar = document.getElementById("iniciar");
const botonPausar = document.getElementById("pausar");
const botonReiniciar = document.getElementById("reiniciar");

const botonIzquierda = document.getElementById("izquierda");
const botonDerecha = document.getElementById("derecha");

// 2. VARIABLES
let puntos = 0;
let vidas = 3;
let tiempo = 60;

let jugando = false;
let terminado = false;

let frutas = [];
let ultimaFruta = 0;
let tiempoAnterior = 0;
let ultimoFrame = 0;

const cesta = {
    x: 355,
    y: 380,
    ancho: 90,
    alto: 48,
    velocidad: 360
};

const teclas = {
    izquierda: false,
    derecha: false
};

const tiposFrutas = ["🍎", "🍓", "🍊", "🍍", "🍉", "🍌"];

// 3. DIBUJAR PAISAJE DEL CHAPARE
function dibujarPaisaje() {

    // Cielo
    const cielo = ctx.createLinearGradient(0, 0, 0, 450);
    cielo.addColorStop(0, "#72c9ef");
    cielo.addColorStop(1, "#d4f3d5");

    ctx.fillStyle = cielo;
    ctx.fillRect(0, 0, 800, 450);

    // Sol
    ctx.fillStyle = "#ffe98a";
    ctx.beginPath();
    ctx.arc(690, 65, 35, 0, Math.PI * 2);
    ctx.fill();

    // Montañas lejanas
    ctx.fillStyle = "#578e63";
    ctx.beginPath();
    ctx.moveTo(0, 230);
    ctx.lineTo(150, 85);
    ctx.lineTo(300, 230);
    ctx.lineTo(460, 100);
    ctx.lineTo(650, 230);
    ctx.lineTo(800, 120);
    ctx.lineTo(800, 350);
    ctx.lineTo(0, 350);
    ctx.fill();

    // Montañas cercanas
    ctx.fillStyle = "#367d50";
    ctx.beginPath();
    ctx.moveTo(0, 290);
    ctx.lineTo(180, 165);
    ctx.lineTo(360, 300);
    ctx.lineTo(530, 175);
    ctx.lineTo(800, 300);
    ctx.lineTo(800, 450);
    ctx.lineTo(0, 450);
    ctx.fill();

    // Árboles tropicales
    for (let i = 0; i < 10; i++) {

        const x = i * 95 + 10;

        ctx.fillStyle = "#80552e";
        ctx.fillRect(x, 270, 12, 105);

        ctx.fillStyle = "#176c36";
        ctx.beginPath();
        ctx.arc(x + 6, 260, 34, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#269447";
        ctx.beginPath();
        ctx.arc(x - 12, 270, 23, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x + 24, 270, 23, 0, Math.PI * 2);
        ctx.fill();
    }

    // Suelo
    ctx.fillStyle = "#398d42";
    ctx.fillRect(0, 390, 800, 60);

    ctx.fillStyle = "#a4d96d";

    for (let i = 0; i < 35; i++) {
        ctx.beginPath();
        ctx.arc(i * 25, 405, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 4. DIBUJAR CESTA
function dibujarCesta() {
 // Cuerpo de la cesta
    ctx.fillStyle = "#a9682f";

    ctx.beginPath();

    ctx.roundRect(
        cesta.x,
        cesta.y,
        cesta.ancho,
        cesta.alto,
        10
    );

    ctx.fill();

    // Borde superior
    ctx.strokeStyle = "#70421e";
    ctx.lineWidth = 6;

    ctx.strokeRect(
        cesta.x,
        cesta.y,
        cesta.ancho,
        10
    );
}

// 5. CREAR FRUTAS Y BOMBAS
function crearFruta() {

    const esBomba = Math.random() < 0.20;

    const fruta = {
        x: Math.random() * 750 + 25,
        y: -30,
        velocidad: 90 + Math.random() * 80,
        tipo: esBomba
            ? "💣"
            : tiposFrutas[
                Math.floor(Math.random() * tiposFrutas.length)
            ],
        esBomba: esBomba
    };

    frutas.push(fruta);
}

// 6. DIBUJAR FRUTAS
function dibujarFrutas() {

    ctx.font = "30px Arial";
    ctx.textAlign = "center";

    frutas.forEach(fruta => {
        ctx.fillText(fruta.tipo, fruta.x, fruta.y);
    });
}

// 7. MOVER CESTA
function moverCesta(delta) {

    if (teclas.izquierda) {
        cesta.x -= cesta.velocidad * delta;
    }

    if (teclas.derecha) {
        cesta.x += cesta.velocidad * delta;
    }

    cesta.x = Math.max(
        0,
        Math.min(800 - cesta.ancho, cesta.x)
    );
}

// 8. COMPROBAR COLISIONES
function comprobarColisiones() {

    frutas = frutas.filter(fruta => {

        const atrapada =
            fruta.y >= cesta.y &&
            fruta.y <= cesta.y + cesta.alto &&
            fruta.x >= cesta.x - 10 &&
            fruta.x <= cesta.x + cesta.ancho + 10;

        if (atrapada) {

            if (fruta.esBomba) {

                vidas--;

                if (vidas <= 0) {
                    vidas = 0;
                    finalizarJuego();
                }

            } else {

                puntos += 10;

            }

            actualizarMarcador();
            return false;
        }

        // Si cae al suelo, desaparece sin quitar vidas
        if (fruta.y > 450) {
            return false;
        }

        return true;
    });
}

// 9. ACTUALIZAR MARCADOR
function actualizarMarcador() {

    puntosHTML.textContent =
        String(puntos).padStart(3, "0");

    vidasHTML.textContent =
        "❤️ ".repeat(vidas).trim() || "Sin vidas";

    tiempoHTML.textContent = tiempo + " s";
}

// 10. ACTUALIZAR JUEGO
function actualizarJuego(delta) {

    if (!jugando) return;

    moverCesta(delta);

    // Crear frutas cada 0.9 segundos
    ultimaFruta += delta;

    if (ultimaFruta >= 0.9) {
        crearFruta();
        ultimaFruta -= 0.9;
    }

    // Caída lenta
    frutas.forEach(fruta => {
        fruta.y += fruta.velocidad * delta;
    });

    comprobarColisiones();

    if (!jugando) return;

    // Cuenta regresiva
    tiempoAnterior += delta;

    if (tiempoAnterior >= 1) {
        tiempo--;
        tiempoAnterior -= 1;
    }

    if (tiempo <= 0) {
        tiempo = 0;
        finalizarJuego();
    }

    actualizarMarcador();
}

// 11. DIBUJAR JUEGO
function dibujarJuego() {

    ctx.clearRect(0, 0, 800, 450);

    dibujarPaisaje();
    dibujarFrutas();
    dibujarCesta();
}

// 12. FINALIZAR JUEGO
function finalizarJuego() {

    jugando = false;
    terminado = true;

    teclas.izquierda = false;
    teclas.derecha = false;

    mensajeHTML.textContent =
        "🏆 ¡FIN DEL JUEGO! Conseguistes " +
        puntos + " puntos. ¡Inténtalo otra vez!";
}

// 13. INICIAR JUEGO
function iniciarJuego() {

    if (terminado) {
        reiniciarJuego();
        return;
    }

    if (!jugando) {
        jugando = true;
        mensajeHTML.textContent =
            "🍎 ¡Atrapa las frutas y evita las bombas!";
    }
}

// 14. PAUSAR JUEGO
function pausarJuego() {

    if (!jugando) return;

    jugando = false;

    teclas.izquierda = false;
    teclas.derecha = false;

    mensajeHTML.textContent = "⏸️ Juego pausado";
}

// 15. REINICIAR JUEGO
function reiniciarJuego() {

    puntos = 0;
    vidas = 3;
    tiempo = 60;

    frutas = [];

    ultimaFruta = 0;
    tiempoAnterior = 0;

    cesta.x = 355;

    teclas.izquierda = false;
    teclas.derecha = false;

    terminado = false;
    jugando = true;

    mensajeHTML.textContent =
        "🍓 ¡Nueva partida!";

    actualizarMarcador();
}

// 16. BOTONES
botonIniciar.addEventListener("click", iniciarJuego);
botonPausar.addEventListener("click", pausarJuego);
botonReiniciar.addEventListener("click", reiniciarJuego);

// 17. TECLADO
document.addEventListener("keydown", function(evento) {

    if (evento.key === "ArrowLeft") {
        teclas.izquierda = true;
        evento.preventDefault();
    }

    if (evento.key === "ArrowRight") {
        teclas.derecha = true;
        evento.preventDefault();
    }
});

document.addEventListener("keyup", function(evento) {

    if (evento.key === "ArrowLeft") {
        teclas.izquierda = false;
    }

    if (evento.key === "ArrowRight") {
        teclas.derecha = false;
    }
});

// 18. CONTROLES DE CELULAR
function controlarBoton(boton, direccion) {

    boton.addEventListener("pointerdown", function(evento) {
        evento.preventDefault();
        teclas[direccion] = true;
    });

    function soltar() {
        teclas[direccion] = false;
    }

    boton.addEventListener("pointerup", soltar);
    boton.addEventListener("pointerleave", soltar);
    boton.addEventListener("pointercancel", soltar);
}

controlarBoton(botonIzquierda, "izquierda");
controlarBoton(botonDerecha, "derecha");

// 19. BUCLE PRINCIPAL
function buclePrincipal(ahora) {

    const delta = ultimoFrame
        ? Math.min((ahora - ultimoFrame) / 1000, 0.05)
        : 0;

    ultimoFrame = ahora;

    actualizarJuego(delta);
    dibujarJuego();

    requestAnimationFrame(buclePrincipal);
}

// 20. PREPARAR PARTIDA
actualizarMarcador();
dibujarJuego();

requestAnimationFrame(buclePrincipal);