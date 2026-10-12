import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Swal from "sweetalert2";
import Acciones from "./Acciones.js";
import { atk_basico, atk_especial, cargar_ki } from './interfaz.js';

const btn_player1 = document.getElementById("btn_player1");
const btn_player2 = document.getElementById("btn_player2");
const player1 = document.getElementById("py1");
const player2 = document.getElementById("py2");
const nombre1 = document.getElementById("player1");
const nombre2 = document.getElementById("player2");
const nombres = document.getElementById("nombres");
const panel_juego = document.getElementById("panel_juego");

// Elementos visuales
const username1 = document.getElementById("username1");
const personaje1 = document.getElementById("personaje1");
const img1 = document.getElementById("img1");

const username2 = document.getElementById("username2");
const personaje2 = document.getElementById("personaje2");
const img2 = document.getElementById("img2");

// Barras
const vida1 = document.getElementById("vida1");
const energia1 = document.getElementById("energia1");
const ki1 = document.getElementById("ki1");

const vida2 = document.getElementById("vida2");
const energia2 = document.getElementById("energia2");
const ki2 = document.getElementById("ki2");

// Contadores de semillas
const semillas1 = document.getElementById("semillas1");
const semillas2 = document.getElementById("semillas2");

// Botones de acción Jugador 1
const btn_atk1 = document.getElementById("atq_basico1");
const btn_esp1 = document.getElementById("atq_esp1");
const btn_ki1 = document.getElementById("cargar_ki1");
const btn_semilla1 = document.getElementById("semilla1");

// Botones de acción Jugador 2
const btn_atk2 = document.getElementById("atq_basico2");
const btn_esp2 = document.getElementById("atq_esp2");
const btn_ki2 = document.getElementById("cargar_ki2");
const btn_semilla2 = document.getElementById("semilla2");

let pj1 = "", pj2 = "";
let jugador1, jugador2;

// Control de inicio y descanso entre ataques
let batallaIniciada = false;
let turno = null; // jugador que tiene el turno actual
let juegoTerminado = false; // se activa cuando alguien gana
const descansos = new WeakMap();
const DURACION_DESCANSO_BASICO = 3;
const DURACION_DESCANSO_ESPECIAL = 5;

// el ataque especial se desbloquea después de que CADA jugador
// haya jugado este número de turnos (2 turnos cada uno).
const TURNOS_PARA_ESPECIAL = 2;
let turnosJugados = 0; // total de turnos jugados entre ambos jugadores
const especialDisponible = () => turnosJugados >= TURNOS_PARA_ESPECIAL * 2;

// Configuración de la animación de ataque
const ARCHIVO_ATK_BASICO = "ataque.png";
const ARCHIVO_ATK_ESPECIAL = "especial.png";
const DURACION_ANIMACION = 1000; // milisegundos que se muestra el sprite
const COLOR_TINTE = "rgba(80, 200, 60, 0.35)"; // color de fondo durante el ataque

// Imagen del escenario de fondo (encodeURI porque la ruta tiene espacios)
const FONDO_ESCENARIO = encodeURI("./public/img/Escenario de batalla/Imagen pegada.png");

// Aplica el fondo a toda la página
const aplicarFondo = () => {
    document.body.classList.remove("bg-light");
    document.body.style.backgroundImage = `url("${FONDO_ESCENARIO}")`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center bottom";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.minHeight = "100vh";
};
aplicarFondo();

const msj_error = (msj) => {
    Swal.fire({
        icon: "warning",
        title: "Error!",
        text: msj
    });
};

const actualizar_barra = (barra, valor) => {
    barra.style.width = `${valor}%`;
    barra.innerText = `${valor}%`;
};

const barras = () => {
    if (jugador1) {
        actualizar_barra(vida1, jugador1.getVida());
        actualizar_barra(energia1, jugador1.getEnergia());
        actualizar_barra(ki1, jugador1.getKi());
        semillas1.innerText = jugador1.getSemilla();
    }

    if (jugador2) {
        actualizar_barra(vida2, jugador2.getVida());
        actualizar_barra(energia2, jugador2.getEnergia());
        actualizar_barra(ki2, jugador2.getKi());
        semillas2.innerText = jugador2.getSemilla();
    }
};

// Muestra el sprite de ataque grande en el centro de la pantalla
let overlayAtaque = null;
let temporizadorAtaque = null;

const mostrarAtaque = (personaje, archivo, invertir = false) => {
    // El overlay se crea una sola vez y se reutiliza
    if (!overlayAtaque) {
        overlayAtaque = document.createElement("div");
        overlayAtaque.style.cssText = `
            position: fixed;
            inset: 0;
            display: none;
            align-items: center;
            justify-content: center;
            background: ${COLOR_TINTE};
            z-index: 1040;
            pointer-events: none;
        `;
        const imagen = document.createElement("img");
        imagen.style.cssText = `
            height: 45vh;
            max-width: 90vw;
            object-fit: contain;
            image-rendering: pixelated;
        `;
        overlayAtaque.appendChild(imagen);
        document.body.appendChild(overlayAtaque);
    }

    const imagen = overlayAtaque.querySelector("img");

    // Si no existe la imagen de ataque, usa la imagen base del personaje
    imagen.onerror = () => {
        imagen.onerror = null;
        imagen.src = `./public/img/${personaje}/base.png`;
    };
    imagen.src = `./public/img/${personaje}/${archivo}`;
    imagen.style.transform = invertir ? "scaleX(-1)" : "none";

    overlayAtaque.style.display = "flex";

    clearTimeout(temporizadorAtaque);
    temporizadorAtaque = setTimeout(() => {
        overlayAtaque.style.display = "none";
    }, DURACION_ANIMACION);
};

const iniciar_juego = () => {
    panel_juego.classList.remove("d-none");

    username1.innerText = nombre1.value;
    personaje1.innerText = pj1;
    img1.src = `./public/img/${pj1}/base.png`;

    username2.innerText = nombre2.value;
    personaje2.innerText = pj2;
    img2.src = `./public/img/${pj2}/base.png`;

    barras();
    aplicarTurno(); // bloquea todo hasta que empiece la batalla

    // La batalla comienza únicamente después de la cuenta regresiva.
    batallaIniciada = false;
    iniciarCuentaRegresiva();
};

const remover_seleccion = (color, ...elementos) => {
    elementos.forEach((elemento) => {
        elemento.classList.remove("bg-warning");
        elemento.classList.add("bg-" + color);
    });
};

const juego_listo = () => {
    if (!jugador1 || !jugador2) {
        msj_error("¡El juego no ha comenzado!");
        return false;
    }
    if (juegoTerminado) {
        return false;
    }
    if (!batallaIniciada) {
        msj_error("¡Espera a que termine la cuenta regresiva!");
        return false;
    }
    return true;
};

const obtenerBotonesAtaque = (jugador) => {
    if (jugador === jugador1) return [btn_atk1, btn_esp1];
    return [btn_atk2, btn_esp2];
};

const obtenerBotonesAccion = (jugador) => {
    if (jugador === jugador1) return [btn_atk1, btn_esp1, btn_ki1, btn_semilla1];
    return [btn_atk2, btn_esp2, btn_ki2, btn_semilla2];
};

const iniciarDescanso = (jugador, segundos) => {
    // Si ya estaba descansando, no se inicia otro contador.
    if (descansos.has(jugador)) return;

    let restantes = segundos;
    const botonesAtaque = obtenerBotonesAtaque(jugador);
    const botonesAccion = obtenerBotonesAccion(jugador);

    descansos.set(jugador, true);
    botonesAccion.forEach((boton) => {
        boton.disabled = true;
    });

    const actualizarDescanso = () => {
        botonesAtaque.forEach((boton) => {
            boton.innerText = `Recargando ${restantes}s`;
        });
        barras();
    };

    actualizarDescanso();

    const intervalo = setInterval(() => {
        restantes--;
        // CAMBIO: se quitó jugador.recargarPoderes(5) para que el Ki
        // ya no se recargue solo. Ahora solo sube con el botón "Cargar Ki".
        barras();

        if (restantes <= 0) {
            clearInterval(intervalo);
            descansos.delete(jugador);
            botonesAtaque.forEach((boton) => {
                boton.disabled = false;
                boton.innerText = boton.id.includes("esp") ? "Ataque especial" : "Ataque básico";
            });
            botonesAccion.filter((boton) => !botonesAtaque.includes(boton)).forEach((boton) => {
                boton.disabled = false;
            });
            aplicarTurno(); // respeta de quién es el turno y el bloqueo del especial
            barras();
        } else {
            actualizarDescanso();
        }
    }, 1000);
};

const estaDescansando = (jugador) => descansos.has(jugador);

// Solo el jugador en turno (y que no esté recargando) tiene botones activos.
// NUEVO: el botón de ataque especial sigue bloqueado hasta que esté disponible.
const aplicarTurno = () => {
    const especial = especialDisponible();

    [jugador1, jugador2].forEach((jugador) => {
        const habilitado = jugador === turno && !estaDescansando(jugador);
        obtenerBotonesAccion(jugador).forEach((boton) => {
            boton.disabled = !habilitado;
        });

        const btnEsp = jugador === jugador1 ? btn_esp1 : btn_esp2;

        // Mientras el especial esté bloqueado, el botón siempre queda deshabilitado
        if (!especial) {
            btnEsp.disabled = true;
        }

        // Etiqueta del botón (no se toca si el jugador está recargando)
        if (!estaDescansando(jugador)) {
            btnEsp.innerHTML = especial
                ? "Ataque especial"
                : '<i class="fa-solid fa-lock"></i> Ataque especial';
        }
    });
};

// Aviso del turno actual
const mostrarTurno = () => {
    const nombre = turno === jugador1 ? nombre1.value : nombre2.value;
    Swal.fire({
        toast: true,
        position: "top",
        icon: "info",
        title: `Turno de ${nombre}`,
        showConfirmButton: false,
        timer: 1500
    });
};

// Pasa el turno al oponente y bloquea al jugador que acaba de actuar
const pasarTurno = () => {
    turno = turno === jugador1 ? jugador2 : jugador1;
    turnosJugados++; // NUEVO: cuenta cada turno jugado
    aplicarTurno();
    mostrarTurno();
};

// Revisa si algún jugador se quedó sin vida y anuncia al ganador
const verificarGanador = () => {
    const vida_j1 = jugador1.getVida();
    const vida_j2 = jugador2.getVida();

    if (vida_j1 > 0 && vida_j2 > 0) return false;

    juegoTerminado = true;
    turno = null;
    aplicarTurno(); // bloquea los botones de ambos jugadores

    let titulo, texto;
    if (vida_j1 <= 0 && vida_j2 <= 0) {
        titulo = "¡EMPATE!";
        texto = "Ambos guerreros han caído.";
    } else if (vida_j1 <= 0) {
        titulo = `¡${nombre2.value} GANÓ!`;
        texto = `${pj2} derrotó a ${pj1}.`;
    } else {
        titulo = `¡${nombre1.value} GANÓ!`;
        texto = `${pj1} derrotó a ${pj2}.`;
    }

    Swal.fire({
        icon: "success",
        title: titulo,
        text: texto,
        confirmButtonText: "Jugar de nuevo",
        allowOutsideClick: false,
        allowEscapeKey: false
    }).then(() => {
        location.reload();
    });

    return true;
};

const iniciarCuentaRegresiva = async () => {
    const pasos = [
        { titulo: "3", color: "#dc3545" },
        { titulo: "2", color: "#ffc107" },
        { titulo: "1", color: "#198754" },
        { titulo: "¡BATALLA!", color: "#0d6efd" }
    ];

    for (const paso of pasos) {
        await Swal.fire({
            title: paso.titulo,
            color: paso.color,
            background: "rgba(0,0,0,0.9)",
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            timer: paso.titulo === "¡BATALLA!" ? 900 : 700,
            timerProgressBar: false
        });
    }

    batallaIniciada = true;
    await Swal.fire({
        icon: "success",
        title: "¡COMIENZA LA BATALLA!",
        text: "¡Que gane el mejor guerrero!",
        showConfirmButton: false,
        timer: 1000
    });

    // El primer turno es del jugador 1
    turno = jugador1;
    aplicarTurno();
    mostrarTurno();
};

// Solo letras y números en los nombres
nombre1.addEventListener("input", (event) => {
    event.target.value = event.target.value.replace(/[^a-zA-Z0-9]+/g, "");
});
nombre2.addEventListener("input", (event) => {
    event.target.value = event.target.value.replace(/[^a-zA-Z0-9]+/g, "");
});

// Selección de personajes
[...player1.querySelectorAll("img")].forEach((imagen) => {
    imagen.addEventListener("click", (event) => {
        remover_seleccion("danger", ...player1.querySelectorAll("img"));
        event.target.classList.remove("bg-danger");
        event.target.classList.add("bg-warning");
        pj1 = event.target.alt;
    });
});

[...player2.querySelectorAll("img")].forEach((imagen) => {
    imagen.addEventListener("click", (event) => {
        remover_seleccion("primary", ...player2.querySelectorAll("img"));
        event.target.classList.remove("bg-primary");
        event.target.classList.add("bg-warning");
        pj2 = event.target.alt;
    });
});

// Confirmar jugadores
btn_player1.addEventListener("click", () => {
    if (nombre1.value == "") {
        return msj_error("El jugador 1 no ha ingresado un nombre de usuario!");
    } else if (pj1 == "") {
        return msj_error("El jugador 1 debe seleccionar un personaje!");
    }
    jugador1 = new Acciones(nombre1.value, pj1);
    nombre1.disabled = true;
    player1.classList.add("d-none");
    if (jugador1 && jugador2) {
        nombres.classList.add("d-none");
        iniciar_juego();
    }
});

btn_player2.addEventListener("click", () => {
    if (nombre2.value == "") {
        return msj_error("El jugador 2 no ha ingresado un nombre de usuario!");
    } else if (pj2 == "") {
        return msj_error("El jugador 2 debe seleccionar un personaje!");
    }
    jugador2 = new Acciones(nombre2.value, pj2);
    nombre2.disabled = true;
    player2.classList.add("d-none");
    if (jugador1 && jugador2) {
        nombres.classList.add("d-none");
        iniciar_juego();
    }
});

// --- ACCIONES JUGADOR 1 ---
btn_atk1.addEventListener("click", () => {
    if (!juego_listo() || estaDescansando(jugador1)) return;
    atk_basico(jugador1, jugador2);
    mostrarAtaque(pj1, ARCHIVO_ATK_BASICO, false);
    barras();
    iniciarDescanso(jugador1, DURACION_DESCANSO_BASICO);
    if (verificarGanador()) return;
    pasarTurno();
});

btn_esp1.addEventListener("click", () => {
    if (!juego_listo() || estaDescansando(jugador1)) return;
    // NUEVO: el especial solo se puede usar después del turno 2 de ambos jugadores
    if (!especialDisponible()) {
        return msj_error(`El ataque especial se desbloquea después del turno ${TURNOS_PARA_ESPECIAL} de ambos jugadores`);
    }
    if (!atk_especial(jugador1, jugador2)) {
        return msj_error("No tienes suficiente Ki o Energía para el ataque especial");
    }
    mostrarAtaque(pj1, ARCHIVO_ATK_ESPECIAL, false);
    barras();
    iniciarDescanso(jugador1, DURACION_DESCANSO_ESPECIAL);
    if (verificarGanador()) return;
    pasarTurno();
});

btn_ki1.addEventListener("click", () => {
    if (!juego_listo()) return;
    cargar_ki(jugador1);
    barras();
    pasarTurno();
});

btn_semilla1.addEventListener("click", () => {
    if (!juego_listo()) return;
    if (jugador1.getSemilla() <= 0) {
        return msj_error("¡No te quedan semillas del ermitaño!");
    }
    jugador1.curacion();
    barras();
    pasarTurno();
});

// --- ACCIONES JUGADOR 2 ---
btn_atk2.addEventListener("click", () => {
    if (!juego_listo() || estaDescansando(jugador2)) return;
    atk_basico(jugador2, jugador1);
    mostrarAtaque(pj2, ARCHIVO_ATK_BASICO, true); // invertido para mirar a la izquierda
    barras();
    iniciarDescanso(jugador2, DURACION_DESCANSO_BASICO);
    if (verificarGanador()) return;
    pasarTurno();
});

btn_esp2.addEventListener("click", () => {
    if (!juego_listo() || estaDescansando(jugador2)) return;
    // NUEVO: el especial solo se puede usar después del turno 2 de ambos jugadores
    if (!especialDisponible()) {
        return msj_error(`El ataque especial se desbloquea después del turno ${TURNOS_PARA_ESPECIAL} de ambos jugadores`);
    }
    if (!atk_especial(jugador2, jugador1)) {
        return msj_error("No tienes suficiente Ki o Energía para el ataque especial");
    }
    mostrarAtaque(pj2, ARCHIVO_ATK_ESPECIAL, true);
    barras();
    iniciarDescanso(jugador2, DURACION_DESCANSO_ESPECIAL);
    if (verificarGanador()) return;
    pasarTurno();
});

btn_ki2.addEventListener("click", () => {
    if (!juego_listo()) return;
    cargar_ki(jugador2);
    barras();
    pasarTurno();
});

btn_semilla2.addEventListener("click", () => {
    if (!juego_listo()) return;
    if (jugador2.getSemilla() <= 0) {
        return msj_error("¡No te quedan semillas del ermitaño!");
    }
    jugador2.curacion();
    barras();
    pasarTurno();
});