const utils = require(__dirname + "/../utils.js");
const { debug, die, de_timestamp_a_fecha, de_fecha_a_timestamp, coincide_patron, cronometro } = utils;
const cronometro_inicial = cronometro();
let turnos = 0;

const dibujar_barra = function(carga, total) {
    const porcentaje_carga = (carga / total) * 10;
    let salida = Math.round(porcentaje_carga * 10) + "%: [";
    for(let index = 0; index < 10; index++) {
        if (index <= porcentaje_carga) {
            salida += "=";
        } else {
            salida += " ";
        }
    }
    return salida += "]";
};

module.exports = function (args) {
    let {
        separacion = "0.17",
        incluirEstilo = undefined,
        excluirEstilo = undefined,
        cargaIzquierda = "50",
        cargaDerecha = "50"
    } = args;
    const separacionFloat = parseFloat(separacion) * 100;
    const separacionFloatMs = separacionFloat * 10;
    const cargaIzquierdaFloat = parseFloat(cargaIzquierda);
    const cargaDerechaFloat = parseFloat(cargaDerecha);
    const ficheros = args._;
    const finales_anteriores = [];
    const estadisticas = {
        total_de_subtitulos: 0,
        total_de_solapamientos: 0,
        total_de_solapamientos_descartados_por_estilo_excluido: 0,
        total_de_solapamientos_descartados_por_estilo_incluido: 0
    };
    if (ficheros.length <= 0) throw new Error("Se requieren parámetros de fichero en el comando «separar» (ej. xass -x separar fichero1.ass)");
    if (typeof cargaIzquierdaFloat !== "number") throw new Error("Se requiere parámetro --carga-izquierda ser un número en el comando «separar»");
    if (typeof cargaDerechaFloat !== "number") throw new Error("Se requiere parámetro --carga-derecha ser un número en el comando «separar»");
    if ((cargaIzquierdaFloat + cargaDerechaFloat) !== 100) throw new Error("Se requieren parámetros --carga-derecha y --carga-izquierda sumar 100 entre sí en el comando «separar»");
    Iterando_ficheros_de_parametros:
    for (let index = 0; index < ficheros.length; index++) {
        const fichero = ficheros[index];
        const ruta = require("path").resolve(fichero);
        const contenido = require("fs").readFileSync(ruta).toString();
        const estructura = require("ass-parser")(contenido);
        debug(`· Separando comentarios en fichero [${index + 1}/${args._.length}]: ${ruta}`);
        Iterando_secciones:
        for (let sectionIndex = 0; sectionIndex < estructura.length; sectionIndex++) {
            const seccion = estructura[sectionIndex];
            Iterando_subtitulos:
            for (let bodyIndex = 0; bodyIndex < seccion.body.length; bodyIndex++) {
                const subtitulo = seccion.body[bodyIndex];
                estadisticas.total_de_subtitulos++;
                // debug(`· Acerca de subtítulo «${bodyIndex}» (${subtitulo.key}) de la sección «${seccion.section}»`);
                Si_subtitulo_no_tiene_inicio_definido:
                if (typeof subtitulo.value.Start === "undefined") {
                    continue Iterando_subtitulos;
                }
                const previoStart = subtitulo.value.Start;
                const previoMomentoInicio = de_timestamp_a_fecha(previoStart);
                let subtitulos_de_separacion_prudenciales_para_acotar = 20;
                let subtitulos_que_no_superan_la_diferencia = 0;
                Iterando_subtitulos_anteriores:
                for (let contraBodyIndex = finales_anteriores.length - 1; contraBodyIndex >= 0; contraBodyIndex--) {
                    Si_demasiados_subtitulos_no_superan_la_diferencia_seguidos:
                    if (subtitulos_que_no_superan_la_diferencia > subtitulos_de_separacion_prudenciales_para_acotar) {
                        break Iterando_subtitulos_anteriores;
                    }
                    const contrasubtitulo = finales_anteriores[contraBodyIndex];
                    const [previoMomentoFinal, subtitulo_anterior, seccion_subtitulo_anterior, indicesJuntos] = contrasubtitulo;
                    //debug(`· Comparado con subtítulo «${contraBodyIndex}» de la sección «${seccion_subtitulo_anterior}»`);
                    const milisegundos_de_diferencia = previoMomentoInicio - previoMomentoFinal;
                    const son_misma_seccion = seccion_subtitulo_anterior === seccion.section;
                    const no_supera_minimo_diferencia_negativo = milisegundos_de_diferencia > (-separacionFloatMs);
                    const no_supera_minimo_diferencia_positivo = milisegundos_de_diferencia < separacionFloatMs;
                    Si_no_hay_aglutinamiento:
                    if (!(no_supera_minimo_diferencia_negativo && no_supera_minimo_diferencia_positivo && son_misma_seccion)) {
                        subtitulos_que_no_superan_la_diferencia++;
                        break Iterando_subtitulos_anteriores;
                    }
                    Gestionando_aglutinamiento: {
                        // Paso 1: Comprobar estilos:
                        Comprobando_estilos: {
                            if (typeof excluirEstilo === "string") {
                                if (coincide_patron(subtitulo.value.Style, excluirEstilo)) {
                                    //debug("Subtítulo filtrado por exclusión de estilo en subtítulo B: ", subtitulo);
                                    estadisticas.total_de_solapamientos_descartados_por_estilo_excluido++;
                                    break Gestionando_aglutinamiento;
                                } else {
                                    // @OK...
                                }
                                if (coincide_patron(subtitulo_anterior.value.Style, excluirEstilo)) {
                                    //debug("Subtítulo filtrado por exclusión de estilo en subtítulo A: ", subtitulo_anterior);
                                    estadisticas.total_de_solapamientos_descartados_por_estilo_excluido++;
                                    break Gestionando_aglutinamiento;
                                } else {
                                    // @OK...
                                }
                            }
                            if (typeof incluirEstilo === "string") {
                                if (coincide_patron(subtitulo.value.Style, incluirEstilo)) {
                                    // @OK...
                                } else {
                                    //debug("Subtítulo filtrado por inclusión de estilo en subtítulo B: ", subtitulo);
                                    estadisticas.total_de_solapamientos_descartados_por_estilo_incluido++;
                                    break Gestionando_aglutinamiento;
                                }
                                if (coincide_patron(subtitulo_anterior.value.Style, incluirEstilo)) {
                                    // @OK...
                                } else {
                                    //debug("Subtítulo filtrado por inclusión de estilo en subtítulo A: ", subtitulo_anterior);
                                    estadisticas.total_de_solapamientos_descartados_por_estilo_incluido++;
                                    break Gestionando_aglutinamiento;
                                }
                            }
                        } /*::Comprobando_estilos*/
                        const longitud_de_movimiento = Math.abs(separacionFloatMs) - Math.abs(milisegundos_de_diferencia);
                        const movimiento_izquierda = (longitud_de_movimiento / 100) * cargaIzquierda;
                        const movimiento_derecha = (longitud_de_movimiento / 100) * cargaDerecha;
                        const valorFinalPrevio = subtitulo_anterior.value.End;
                        const [ sectionIndexPrevio, bodyIndexPrevio ] = indicesJuntos;
                        // Paso 2: Aplicar cambios en inicio y final:
                        Aplicando_cambios: {
                            if (typeof estructura[sectionIndex].body[bodyIndex].value.Start === "undefined") {
                                break Aplicando_cambios;
                            }
                            const es_dif_positiva = milisegundos_de_diferencia >= 0;
                            if(cargaIzquierda) {
                                if (typeof estructura[sectionIndex].body[bodyIndex].value.Fue_modificado_anteriormente !== "undefined") {
                                    break Aplicando_cambios;
                                }
                                const valor_original_izq = estructura[sectionIndexPrevio].body[bodyIndexPrevio].value.End;
                                const fecha_temp_izq = de_timestamp_a_fecha(valor_original_izq);
                                const diferencia = es_dif_positiva ? - movimiento_izquierda : movimiento_izquierda;
                                const nuevos_milisegundos = fecha_temp_izq.getMilliseconds() + diferencia;
                                // console.log(diferencia, nuevos_milisegundos, fecha_temp_izq.getMilliseconds());
                                fecha_temp_izq.setMilliseconds(nuevos_milisegundos);
                                estructura[sectionIndexPrevio].body[bodyIndexPrevio].value.Fue_modificado_anteriormente = true;
                                estructura[sectionIndexPrevio].body[bodyIndexPrevio].value.End = de_fecha_a_timestamp(fecha_temp_izq);
                            }
                            if (cargaDerecha) {
                                if (typeof estructura[sectionIndex].body[bodyIndex].value.Fue_modificado_anteriormente !== "undefined") {
                                    break Aplicando_cambios;
                                }
                                const valor_original_der = estructura[sectionIndex].body[bodyIndex].value.Start;
                                const fecha_temp_der = de_timestamp_a_fecha(valor_original_der);
                                const diferencia = es_dif_positiva ? movimiento_derecha : - movimiento_derecha;
                                const nuevos_milisegundos = fecha_temp_der.getMilliseconds() + diferencia;
                                // console.log(diferencia, nuevos_milisegundos, fecha_temp_der.getMilliseconds());
                                fecha_temp_der.setMilliseconds(nuevos_milisegundos);
                                estructura[sectionIndex].body[bodyIndex].value.Fue_modificado_anteriormente = true;
                                estructura[sectionIndex].body[bodyIndex].value.Start = de_fecha_a_timestamp(fecha_temp_der);
                            }
                        } /*::Aplicando_cambios*/
                        // Paso 3: Imprimir resultado final de los cambios:
                        Imprimiendo_resultados: {
                            const currentStart = estructura[sectionIndex].body[bodyIndex].value.Start;
                            (function (seccion_subtitulo_anterior, indicesJuntos, subtitulo_anterior, milisegundos_de_diferencia, longitud_de_movimiento, movimiento_izquierda, cargaIzquierda, movimiento_derecha, cargaDerecha, seccion, subtitulo) {
                                debug({
                                    "Progreso": dibujar_barra(bodyIndex, seccion.body.length),
                                    "Solapamiento": `${milisegundos_de_diferencia} milisegundos después`,
                                    "Separación mínima": separacionFloatMs,
                                    "Separación concreta": longitud_de_movimiento,
                                    "Subtítulo A": {
                                        "Sección": seccion_subtitulo_anterior,
                                        "Sección (índice)": indicesJuntos[0],
                                        "Subtítulo (índice)": indicesJuntos[1] + " de " + seccion.body.length,
                                        "Clave": subtitulo_anterior.key,
                                        "Style": subtitulo_anterior.value.Style,
                                        "Start": subtitulo_anterior.value.Start,
                                        "End": valorFinalPrevio,
                                        "End modificado": subtitulo_anterior.value.End,
                                        "Movimiento izquierda": (movimiento_izquierda/1000) + " segundos",
                                        "Carga izquierda": cargaIzquierda + "%",
                                        "Texto": subtitulo_anterior.value.Text
                                    },
                                    "Subtítulo B": {
                                        "Sección": seccion.section,
                                        "Sección (índice)": sectionIndex,
                                        "Subtítulo (índice)": bodyIndex + " de " + seccion.body.length,
                                        "Clave": subtitulo.key,
                                        "Style": subtitulo.value.Style,
                                        "Start": previoStart,
                                        "Start modificado": subtitulo.value.Start,
                                        "Movimiento derecha": (movimiento_derecha/1000) + " segundos",
                                        "Carga derecha": cargaDerecha + "%",
                                        "Texto": subtitulo.value.Text
                                    }
                                });
                            })(seccion_subtitulo_anterior, indicesJuntos, subtitulo_anterior, milisegundos_de_diferencia, longitud_de_movimiento, movimiento_izquierda, cargaIzquierda, movimiento_derecha, cargaDerecha, seccion, subtitulo);
                        } /*::Imprimiendo_resultados*/
                        estadisticas.total_de_solapamientos++;
                    } /*::Gestionando_aglutinamiento*/
                } /*::Iterando_subtitulos_anteriores*/
                if (typeof subtitulo.value.End === "undefined") {
                    continue Iterando_subtitulos;
                }
                finales_anteriores.push([ de_timestamp_a_fecha(subtitulo.value.End), subtitulo, seccion.section, [sectionIndex, bodyIndex] ]);
            } /*::Iterando_subtitulos*/
        } /*::Iterando_secciones*/
        const contenido_modificado = require("ass-stringify")(estructura);
        require("fs").writeFileSync(ruta, contenido_modificado, "utf8");
    } /*::Iterando_ficheros_de_parametros*/
    debug(`· Corregidos «${estadisticas.total_de_solapamientos}» solapamientos entre subtítulos de un total de «${estadisticas.total_de_subtitulos}» subtítulos.`)
    debug(`· La separación de subtítulos ha tomado «${cronometro_inicial.tiempo() / 1000}» segundos.`);
    if (estadisticas.total_de_solapamientos_descartados_por_estilo_excluido) {
        debug(`· Se descartaron «${estadisticas.total_de_solapamientos_descartados_por_estilo_excluido}» solapamientos por estilo excluído.`);
    }
    if (estadisticas.total_de_solapamientos_descartados_por_estilo_incluido) {
        debug(`· Se descartaron «${estadisticas.total_de_solapamientos_descartados_por_estilo_incluido}» solapamientos por estilo no incluído.`);
    }
};