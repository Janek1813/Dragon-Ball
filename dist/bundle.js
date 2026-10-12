(() => {
    "use strict";

    const personajes = {
        GOKU: {
            basico: "Kame hame ha!",
            especial: "¡Genkidama!",
            fondo: "rgba(7, 196, 238, 0.7)"
        },
        VEGETA: {
            basico: "¡Cañón de Destello!",
            especial: "¡Final Flash!",
            fondo: "rgba(0, 0, 255, 0.7)"
        },
        PICCOLO: {
            basico: "¡Makankosappo!",
            especial: "¡Cañón Explosivo de Demonio!",
            fondo: "rgba(0, 128, 0, 0.7)"
        },
        GOHAN: {
            basico: "¡Masenko!",
            especial: "¡Kamehameha Padre e Hijo!",
            fondo: "rgba(255, 165, 0, 0.7)"
        },
        VEGITTO: {
            basico: "¡Espada de Espíritu Final!",
            especial: "¡Kamehameha Final Flash!",
            fondo: "rgba(255, 215, 0, 0.7)"
        },
        TRUNKS: {
            basico: "¡Ataque Ardiente!",
            especial: "¡Espada Ráfaga de Ira!",
            fondo: "rgba(128, 0, 128, 0.7)"
        },
        CELL: {
            basico: "¡Kamehameha Solar!",
            especial: "¡Autodestrucción Celular!",
            fondo: "rgba(46, 139, 87, 0.7)"
        },
        GOGETA: {
            basico: "¡Explosión Big Bang!",
            especial: "¡Kamehameha Estelar!",
            fondo: "rgba(255, 69, 0, 0.7)"
        }
    };

    class Personaje {
        constructor(nombre, personaje) {
            this.nombre = nombre;
            this.personaje = personaje;
            this.vida = 100;
            this.ki = 100;
            this.energia = 100;
            this.semilla = 2;
        }

        recargarPoderes(cantidad = 5) {
            this.ki = Math.min(100, this.ki + cantidad);
            this.energia = Math.min(100, this.energia + cantidad);
        }

        atkBasico(oponente) {
            this.energia = Math.max(0, this.energia - 5);
            this.ki = Math.max(0, this.ki - 10);
            if (oponente) oponente.vida = Math.max(0, oponente.vida - 10);
        }

        atkEspecial(oponente) {
            if (this.ki < 20 || this.energia < 15) return false;
            this.energia -= 15;
            this.ki -= 20;
            if (oponente) oponente.vida = Math.max(0, oponente.vida - 25);
            return true;
        }

        cargarKi() {
            this.recargarPoderes(15);
        }

        curacion() {
            if (this.semilla <= 0) return false;
            this.vida = 100;
            this.ki = 100;
            this.energia = 100;
            this.semilla--;
            return true;
        }
    }

    const $ = (id) => document.getElementById(id);

    const btnPlayer1 = $("btn_player1");
    const btnPlayer2 = $("btn_player2");
    const player1 = $("py1");
    const player2 = $("py2");
    const nombre1 = $("player1");
    const nombre2 = $("player2");
    const nombres = $("nombres");

    const username1 = $("username1");
    const personaje1 = $("personaje1");
    const img1 = $("img1");
    const username2 = $("username2");
    const personaje2 = $("personaje2");
    const img2 = $("img2");

    const vida1 = $("vida1"), energia1 = $("energia1"), ki1 = $("ki1");
    const vida2 = $("vida2"), energia2 = $("energia2"), ki2 = $("ki2");
    const semillas1 = $("semillas1"), semillas2 = $("semillas2");

    const btnAtk1 = $("atq_basico1"), btnEsp1 = $("atq_esp1");
    const btnKi1 = $("cargar_ki1"), btnSemilla1 = $("semilla1");
    const btnAtk2 = $("atq_basico2"), btnEsp2 = $("atq_esp2");
    const btnKi2 = $("cargar_ki2"), btnSemilla2 = $("semilla2");

    let pj1 = "", pj2 = "";
    let jugador1 = null, jugador2 = null;
    let batallaIniciada = false;
    const descansos = new WeakMap();

    function error(msj) {
        if (window.Swal) {
            Swal.fire({
                icon: "warning",
                title: "¡Atención!",
                text: msj,
                confirmButtonText: "OK"
            });
        } else {
            alert(msj);
        }
    }

    function actualizarBarra(barra, valor) {
        valor = Math.max(0, Math.min(100, Math.round(valor)));
        barra.style.width = valor + "%";
        barra.innerText = valor + "%";
    }

    function barras() {
        if (jugador1) {
            actualizarBarra(vida1, jugador1.vida);
            actualizarBarra(energia1, jugador1.energia);
            actualizarBarra(ki1, jugador1.ki);
            semillas1.innerText = jugador1.semilla;
        }
        if (jugador2) {
            actualizarBarra(vida2, jugador2.vida);
            actualizarBarra(energia2, jugador2.energia);
            actualizarBarra(ki2, jugador2.ki);
            semillas2.innerText = jugador2.semilla;
        }
    }

    function mostrarAtaque(texto, imagen, fondo) {
        if (!window.Swal) return;
        Swal.fire({
            text: texto,
            imageUrl: imagen,
            imageWidth: 400,
            imageHeight: 400,
            position: "center",
            width: 600,
            color: "#716add",
            background: "none",
            imageAlt: "Ataque",
            backdrop: fondo,
            showConfirmButton: false,
            timer: 1500
        });
    }

    function datosDe(jugador) {
        return personajes[(jugador.personaje || "GOKU").toUpperCase()] || personajes.GOKU;
    }

    function ataqueBasico(j1, j2) {
        j1.atkBasico(j2);
        const d = datosDe(j1);
        mostrarAtaque(d.basico, "./public/img/" + j1.personaje + "/basico.png", d.fondo);
    }

    function ataqueEspecial(j1, j2) {
        if (!j1.atkEspecial(j2)) return false;
        const d = datosDe(j1);
        mostrarAtaque(d.especial, "./public/img/" + j1.personaje + "/especial.png", d.fondo);
        return true;
    }

    function cargarKi(jugador) {
        jugador.cargarKi();
        barras();
        if (window.Swal) {
            Swal.fire({
                icon: "success",
                title: "¡Cargando Ki!",
                text: jugador.nombre + " recuperó Ki y Energía.",
                timer: 1200,
                showConfirmButton: false
            });
        }
    }

    function juegoListo() {
        if (!jugador1 || !jugador2) {
            error("¡El juego no ha comenzado!");
            return false;
        }
        if (!batallaIniciada) {
            error("¡Espera a que termine la cuenta regresiva!");
            return false;
        }
        return true;
    }

    function botonesAtaque(jugador) {
        return jugador === jugador1
            ? [btnAtk1, btnEsp1, btnKi1, btnSemilla1]
            : [btnAtk2, btnEsp2, btnKi2, btnSemilla2];
    }

    function iniciarDescanso(jugador, segundos) {
        if (descansos.has(jugador)) return;

        const botones = botonesAtaque(jugador);
        let restantes = segundos;
        descansos.set(jugador, true);

        botones.forEach(boton => {
            boton.disabled = true;
            boton.dataset.textoOriginal = boton.innerHTML;
        });

        function pintar() {
            botones.forEach(boton => {
                boton.innerText = "Recargando " + restantes + "s";
            });
            barras();
        }

        pintar();

        const intervalo = setInterval(() => {
            restantes--;
            // El descanso también recupera Ki y Energía.
            jugador.recargarPoderes(5);
            barras();

            if (restantes <= 0) {
                clearInterval(intervalo);
                descansos.delete(jugador);
                ataques.forEach(boton => {
                    boton.disabled = false;
                    boton.innerText = boton.id.includes("esp") ? "Ataque especial" : "Ataque básico";
                });
                acciones.forEach(boton => {
                    if (!ataques.includes(boton)) boton.disabled = false;
                });
                barras();
            } else {
                pintar();
            }
        }, 1000);
    }

    function descansando(jugador) {
        return descansos.has(jugador);
    }

    async function cuentaRegresiva() {
        if (!window.Swal) {
            await new Promise(r => setTimeout(r, 500));
            batallaIniciada = true;
            return;
        }

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
                background: "rgba(0,0,0,0.92)",
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                timer: paso.titulo === "¡BATALLA!" ? 1000 : 800
            });
        }

        batallaIniciada = true;

        Swal.fire({
            icon: "success",
            title: "¡COMIENZA LA BATALLA!",
            text: "¡Que gane el mejor guerrero!",
            showConfirmButton: false,
            timer: 1000
        });
    }

    function verificarVictoria() {
        if (!jugador1 || !jugador2) return false;
        if (jugador1.vida <= 0 || jugador2.vida <= 0) {
            batallaIniciada = false;
            [btnAtk1, btnEsp1, btnKi1, btnSemilla1, btnAtk2, btnEsp2, btnKi2, btnSemilla2]
                .forEach(b => b.disabled = true);

            const ganador = jugador1.vida > 0 ? jugador1 : jugador2;
            if (window.Swal) {
                Swal.fire({
                    icon: "success",
                    title: "¡FIN DE LA BATALLA!",
                    text: "¡" + ganador.nombre + " ha ganado!",
                    confirmButtonText: "Aceptar"
                });
            }
            return true;
        }
        return false;
    }

    function iniciarJuego() {
        username1.innerText = nombre1.value;
        personaje1.innerText = pj1;
        img1.src = "./public/img/" + pj1 + "/base.png";

        username2.innerText = nombre2.value;
        personaje2.innerText = pj2;
        img2.src = "./public/img/" + pj2 + "/base.png";

        [btnAtk1, btnEsp1, btnKi1, btnSemilla1, btnAtk2, btnEsp2, btnKi2, btnSemilla2]
            .forEach(b => b.disabled = false);

        barras();
        batallaIniciada = false;
        cuentaRegresiva();
    }

    function removerSeleccion(color, ...elementos) {
        elementos.forEach(e => {
            e.classList.remove("bg-warning");
            e.classList.add("bg-" + color);
        });
    }

    nombre1.addEventListener("input", e => {
        e.target.value = e.target.value.replace(/[^a-zA-Z0-9]+/g, "");
    });
    nombre2.addEventListener("input", e => {
        e.target.value = e.target.value.replace(/[^a-zA-Z0-9]+/g, "");
    });

    [...player1.querySelectorAll("img")].forEach(imagen => {
        imagen.addEventListener("click", e => {
            removerSeleccion("danger", ...player1.querySelectorAll("img"));
            e.target.classList.remove("bg-danger");
            e.target.classList.add("bg-warning");
            pj1 = e.target.alt;
        });
    });

    [...player2.querySelectorAll("img")].forEach(imagen => {
        imagen.addEventListener("click", e => {
            removerSeleccion("primary", ...player2.querySelectorAll("img"));
            e.target.classList.remove("bg-primary");
            e.target.classList.add("bg-warning");
            pj2 = e.target.alt;
        });
    });

    btnPlayer1.addEventListener("click", () => {
        if (nombre1.value === "") return error("El jugador 1 no ha ingresado un nombre de usuario!");
        if (pj1 === "") return error("El jugador 1 debe seleccionar un personaje!");
        jugador1 = new Personaje(nombre1.value, pj1);
        nombre1.disabled = true;
        player1.classList.add("d-none");
        if (jugador1 && jugador2) {
            nombres.classList.add("d-none");
            iniciarJuego();
        }
    });

    btnPlayer2.addEventListener("click", () => {
        if (nombre2.value === "") return error("El jugador 2 no ha ingresado un nombre de usuario!");
        if (pj2 === "") return error("El jugador 2 debe seleccionar un personaje!");
        jugador2 = new Personaje(nombre2.value, pj2);
        nombre2.disabled = true;
        player2.classList.add("d-none");
        if (jugador1 && jugador2) {
            nombres.classList.add("d-none");
            iniciarJuego();
        }
    });

    btnAtk1.addEventListener("click", () => {
        if (!juegoListo() || descansando(jugador1)) return;
        ataqueBasico(jugador1, jugador2);
        barras();
        iniciarDescanso(jugador1, 3);
        verificarVictoria();
    });

    btnEsp1.addEventListener("click", () => {
        if (!juegoListo() || descansando(jugador1)) return;
        if (!ataqueEspecial(jugador1, jugador2)) {
            return error("No tienes suficiente Ki o Energía para el ataque especial");
        }
        barras();
        iniciarDescanso(jugador1, 5);
        verificarVictoria();
    });

    btnKi1.addEventListener("click", () => {
        if (!juegoListo()) return;
        cargarKi(jugador1);
    });

    btnSemilla1.addEventListener("click", () => {
        if (!juegoListo()) return;
        if (!jugador1.curacion()) return error("¡No te quedan semillas del ermitaño!");
        barras();
    });

    btnAtk2.addEventListener("click", () => {
        if (!juegoListo() || descansando(jugador2)) return;
        ataqueBasico(jugador2, jugador1);
        barras();
        iniciarDescanso(jugador2, 3);
        verificarVictoria();
    });

    btnEsp2.addEventListener("click", () => {
        if (!juegoListo() || descansando(jugador2)) return;
        if (!ataqueEspecial(jugador2, jugador1)) {
            return error("No tienes suficiente Ki o Energía para el ataque especial");
        }
        barras();
        iniciarDescanso(jugador2, 5);
        verificarVictoria();
    });

    btnKi2.addEventListener("click", () => {
        if (!juegoListo()) return;
        cargarKi(jugador2);
    });

    btnSemilla2.addEventListener("click", () => {
        if (!juegoListo()) return;
        if (!jugador2.curacion()) return error("¡No te quedan semillas del ermitaño!");
        barras();
    });

    // Al cargar la página los controles de combate quedan bloqueados.
    [btnAtk1, btnEsp1, btnKi1, btnSemilla1, btnAtk2, btnEsp2, btnKi2, btnSemilla2]
        .forEach(b => b.disabled = true);

    barras();
})();