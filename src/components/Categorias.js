import React, { Component } from 'react';
import plusicon from '../assets/plus.svg';

import Swal from 'sweetalert2';
import service from '../services/service';
import './css/Categorias.css';

export class Categorias extends Component {
    currentService = new service();

    state = {
        categorias : null,
        token : false
    }

    componentDidMount = () => {
        this.loadcategories();
        this.setState({
            token : (localStorage.getItem("token") !== null)
        });
    }

    loadcategories = () => {
        this.currentService.getCategorias().then((result) => {
            this.setState({
                categorias : result
            });
        });
    }

    generateCategories = () => {
        new Swal({
            title: 'Nueva categoría',
            html:
                '<label for="swal-input1">Nombre</label></br>' +
                '<input id="swal-input1" class="swal2-input" style="margin-top:5px;margin-bottom:0;max-width:70%;"/></br>' +
                '<p id="error_1" style="display:none; color:red;">El nombre no puede estar vacío</p>' +
                '<p id="error_2" style="display:none; color:red;">Ya existe una categoría con el mismo nombre</p></br>' +
                '<label for="swal-input2">Duración</label></br>' +
                '<input type="time" id="swal-input2" class="swal2-input" value="00:15" style="margin-top:5px;"/></br>' +
                '<p id="error_3" style="display:none; color:red; margin-bottom:0;">Tiempo mínimo: 1 minuto</p>',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Aceptar",
            confirmButtonColor: '#2C4D9E',
            cancelButtonText: "Cancelar",
            preConfirm: () => {
                if(document.getElementById('swal-input1').value) {
                    var auxiliar = this.state.categorias;
                    var correcto = true;
                    auxiliar.forEach(element => {
                        if (document.getElementById('swal-input1').value.toUpperCase() === element.categoria.toUpperCase()) {
                            correcto = false;       
                        }
                    });
                    if (!correcto) { 
                        document.getElementById('error_1').style.display = 'none';
                        document.getElementById('error_2').style.display = 'inline-block';
                        document.getElementById('error_3').style.display = 'none';
                        return false; 
                    };
                }

                if(!document.getElementById('swal-input1').value){
                    document.getElementById('error_1').style.display = 'inline-block';
                    document.getElementById('error_2').style.display = 'none';
                    document.getElementById('error_3').style.display = 'none';
                    return false;
                } else if(document.getElementById('swal-input2').value === "00:00") {
                    document.getElementById('error_1').style.display = 'none';
                    document.getElementById('error_2').style.display = 'none';
                    document.getElementById('error_3').style.display = 'inline-block';
                    return false;
                } else {
                    return [
                        document.getElementById('swal-input1').value,
                        document.getElementById('swal-input2').value
                    ]
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                var newDuration = this.transformDuration(result.value[1]);
                var newCategory = {
                    idCategoria : 0,
                    categoria : result.value[0],
                    duracion : newDuration
                }
                this.currentService.postCategoria(newCategory).then(() => {
                    Swal.fire({
                        title: 'Categoría creada',
                        text: 'Se ha creado la nueva categoría en la base de datos',
                        icon: 'success',
                        confirmButtonColor: "#2C4D9E"
                    });
                    this.loadcategories();
                });
            }
        });
    }

    getInicio = (string_init) => {
        var time = new Date(string_init);
        var time_string = time.toTimeString().split(' ')[0];
        return time_string.substring(0, time_string.length - 3);
    }

    getFinal = (idcat, inicio) => {
        var res = "";
        if (this.state.categorias) {
            var inicio_min = this.transformDuration(this.getInicio(inicio));
            this.state.categorias.forEach(element => {
                if (element.idCategoria === idcat) {
                    inicio_min += element.duracion;
                    res = this.transformMinutes(inicio_min);
                }
            });
        }
        return res;
    }

    getFinalSegunDuracion = (duracion, inicio) => {
        var inicio_min = this.transformDuration(this.getInicio(inicio));
        inicio_min += duracion;
        return this.transformMinutes(inicio_min);
    }

    transformDuration = (duration) => { // Pasar de 01:15 a 75 (min - integer)
        var time = duration.split(":");
        var hours = Number.parseInt(time[0]);
        var minutes = Number.parseInt(time[1]);
        if (hours > 0) {
            hours = hours * 60;
        }
        return hours + minutes;
    }

    transformMinutes = (duration, legend) => { // Pasar de 75 a 01:15 (string)
        var hours = Math.floor(duration / 60);  
        var minutes = duration % 60;
        if (legend) { // Se necesita la leyenda de 'h' y 'min'
            return ((hours === 0)? "" : (hours + "h ")) + ((minutes === 0)? "" : (minutes + " min"));  
        } else {
            return hours.toString().padStart(2,0) + ":" + minutes.toString().padStart(2,0);  
        }
    }

    ejecutarPutCategoria = (newCategory) => {
        this.currentService.putCategoria(newCategory).then(() => {
            Swal.fire({
                title: 'Categoría modificada',
                text: 'Se ha modificado la categoría en la base de datos',
                icon: 'success',
                confirmButtonColor: "#2C4D9E"
            });
            this.loadcategories();
        });
    }

    ejecutarDeleteCategoria = (currentIDCategory) => {
        this.currentService.deleteCategoria(currentIDCategory).then(() => {
            Swal.fire({
                title: 'Categoría eliminada',
                text: 'Se ha eliminado la categoría en la base de datos',
                icon: 'success',
                confirmButtonColor: "#2C4D9E"
            });
            this.loadcategories();
        });
    }

    validarTimer = (temporizador, temporizadores, duracion) => {
        var correcto = true;
        var compare_end = this.getFinalSegunDuracion(duracion, temporizador.inicio);
        var tcompare_end = this.transformDuration(compare_end);
        temporizadores.forEach((tempo) => {
            if (tempo.idTemporizador !== temporizador.idTemporizador) {
                var init = this.transformDuration(this.getInicio(tempo.inicio));                    // Inicio en int
                var end = this.transformDuration(this.getFinal(tempo.idCategoria, tempo.inicio));   // Final en int
                if (tcompare_end > init && tcompare_end <= end) { correcto = false; }    // Valor entre otro rango
                if (tcompare_end > end) { correcto = false; }    // Valor entre otro rango
            }
        });
        return correcto;
    }

    modifyCategory = (index) => {
        if (this.state.token) {
            var currentName = this.state.categorias[index].categoria;
            var currentDuration = this.state.categorias[index].duracion;
            new Swal({
                title: 'Modificar categoría',
                html:
                    '<label for="swal-input1">Nombre</label></br>' +
                    '<input id="swal-input1" class="swal2-input" style="margin-top:5px;margin-bottom:0;max-width:70%;" value="' + 
                    currentName + 
                    '"/></br>' +
                    '<p id="error_1" style="display:none; color:red;">El nombre no puede estar vacío</p>' +
                    '<p id="error_2" style="display:none; color:red;">Ya existe una categoría con el mismo nombre</p>' +
                    '</br><label for="swal-input2">Duración</label></br>' +
                    '<input type="time" id="swal-input2" class="swal2-input" value="' + 
                    this.transformMinutes(currentDuration, false) + 
                    '" style="margin-top:5px;"/></br>' +
                    '<p id="error_3" style="display:none; color:red; margin-bottom:0;">Tiempo mínimo: 1 minuto</p>',
                focusConfirm: false,
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: "Guardar categoría",
                confirmButtonColor: "#2C4D9E",
                denyButtonText: "Eliminar categoría",
                denyButtonColor: "#FF0000",
                cancelButtonText: "Cancelar",
                preConfirm: () => {
                    if(!document.getElementById('swal-input1').value){
                        document.getElementById('error_1').style.display = 'inline-block';
                        document.getElementById('error_2').style.display = 'none';
                        document.getElementById('error_3').style.display = 'none';
                        return false;
                    } else if(document.getElementById('swal-input2').value === "00:00") {
                        document.getElementById('error_1').style.display = 'none';
                        document.getElementById('error_2').style.display = 'none';
                        document.getElementById('error_3').style.display = 'inline-block';
                        return false;
                    } else {
                        var correcto = true;
                        var newName = document.getElementById('swal-input1').value.toUpperCase();
                        if (newName !== currentName.toUpperCase()) {
                            this.state.categorias.forEach(element => {
                                if (element.categoria.toUpperCase() === newName) {
                                    correcto = false;
                                }
                            });
                        }
                        if (correcto) {
                            return [
                                document.getElementById('swal-input1').value,
                                document.getElementById('swal-input2').value
                            ]                        
                        } else {
                            document.getElementById('error_1').style.display = 'none';
                            document.getElementById('error_2').style.display = 'inline-block';
                            document.getElementById('error_3').style.display = 'none';
                            return false;
                        }
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) { // Modificar categoría
                    if (result.value[0].toUpperCase() !== currentName.toUpperCase() || this.transformDuration(result.value[1]) !== currentDuration) {
                        var newCategory = {
                            idCategoria : this.state.categorias[index].idCategoria,
                            categoria : result.value[0],
                            duracion : this.transformDuration(result.value[1])
                        }
                        if (this.transformDuration(result.value[1]) > currentDuration) { // Duración modificada a la alza, entramos en revisión
                            this.currentService.getTemporizadores().then((result_tempos) => { // Obtenemos los temporizadores
                                if (result_tempos.length === 0) { // No hay temporizadores que revisar, ejecutamos el put
                                    this.ejecutarPutCategoria(newCategory);
                                } else {
                                    var tempos_afectados = [];

                                    result_tempos.forEach(tempo => { // Recorremos los temporizadores
                                        if (tempo.idCategoria === newCategory.idCategoria) { // Timer con la categoría asignada
                                            tempos_afectados.push(tempo);
                                        }
                                    });

                                    var correcto = true;
                                    tempos_afectados.forEach(tempo_afectado => {
                                        if (!this.validarTimer(tempo_afectado, result_tempos, newCategory.duracion)) {
                                            correcto = false;
                                        }
                                    });

                                    if (correcto) { // Todos los timers alterados han sido valorados satisfactoriamente
                                        this.ejecutarPutCategoria(newCategory);
                                    } else { // Se producen solapamientos. Se bloquea este cambio
                                        Swal.fire({
                                            title: 'Duración no válida',
                                            text: 'Acción denegada. La nueva ampliación de la duración, produce solapamientos en algunos temporizadores existentes.',
                                            icon: 'error',
                                            showCancelButton: true,
                                            confirmButtonColor: '#2C4D9E',
                                            confirmButtonText: 'Entendido',
                                            cancelButtonText: 'Más información'
                                        }).then((result_message) => {
                                            if (result_message.isDismissed) {
                                                Swal.fire({
                                                    title : 'Control contra solapamiento de tiempos',
                                                    html : '<p style="margin:0;">Se utiliza está medida para evitar que un temporizador se solape con otro.</p><br/>' +
                                                    '<p style="margin:0;"><b>Ejemplo:</b> Es posible que un temporizador se inicie a las <b>12:30</b> si el anterior ' +
                                                    'acaba a la misma hora, pero no es posible que se inicie a las <b>12:29</b> ya que eso ' +
                                                    'provocaría un solapamiento de tiempos.</p><br/><p style="margin:0;"> Esta medida se revisa cada vez que se modifica ' +
                                                    'la hora de inicio o la categoría (por ende la duración) de dicho temporizador. </p>',
                                                    icon : 'info',
                                                    confirmButtonColor: "#2C4D9E"
                                                });
                                            }
                                        });
                                    }
                                }
                            });
                        } else { // No se ha modificado la duración. Directamente se ejecuta el put
                            this.ejecutarPutCategoria(newCategory);
                        }
                    }
                }
                if (result.isDenied) { // Eliminar categoría
                    Swal.fire({
                        title: '¿Estás segur@?',
                        text: "Al eliminar esta categoría también se eliminarán los temporizadores con dicha categoría asignada",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#2C4D9E',
                        cancelButtonColor: '#FF0000',
                        confirmButtonText: 'Sí, estoy segur@',
                        cancelButtonText: 'No, cancelar'
                      }).then((result) => {
                        if (result.isConfirmed) {
                            var currentIDCategory = this.state.categorias[index].idCategoria;
                            this.currentService.getTemporizadores().then((result_timers) => {
                                var counter_timers = 0, borradoCompletado = false;
                                if (result_timers.length === 0) { // ======================== NO HAY TIMERS ASOCIADOS, SE BORRA DIRECTAMENTE
                                    this.ejecutarDeleteCategoria(currentIDCategory);
                                } else { // ================================================= HAY TIMERS ASOCIADOS, SE COMPRUEBAN FALLOS 
                                    result_timers.forEach(timer => {
                                        counter_timers ++;
                                        if (timer.idCategoria === currentIDCategory) { // =========== Timer con la categoría asignada encontrado
                                            this.currentService.getTES().then((result_tes) => { // == Obtengo los registros de los TES asociados
                                                if (result_tes.length === 0) { // =================== NO hay TES asociados, se borra directamente
                                                    this.currentService.deleteTemporizador(timer.idTemporizador).then(() => {
                                                        if (counter_timers === result_timers.length) { // Cuando se eliminen todos los timers, fuera categoría
                                                            this.ejecutarDeleteCategoria(currentIDCategory);
                                                            borradoCompletado = true;
                                                        }
                                                    });
                                                } else { // Existen TES asociados, primero borramos los TES, luego el TIMER 
                                                    var counter_tes = 0;
                                                    result_tes.forEach(registro => { // Recorro los registros de los TES asociados
                                                        counter_tes ++;
                                                        if (registro.idTimer === timer.idTemporizador) {
                                                            this.currentService.deleteTES(registro.id).then(() => {
                                                                if (counter_tes === result_tes.length) {
                                                                    this.currentService.deleteTemporizador(timer.idTemporizador).then(() => {
                                                                        if (counter_timers === result_timers.length) {
                                                                            this.ejecutarDeleteCategoria(currentIDCategory);
                                                                            borradoCompletado = true;
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                        // En el caso de nunca se hubiesen encontrado timers con la categoría actual,
                                        // lo que hacemos es ejecutar directamente el borrado de dicha cartegoría. 
                                        // La variable borradoCompletado determinará si se ha borrado de la BBDD y por
                                        // ende, de si hace falta realizar esta acción, o no.
                                        if (counter_timers === result_timers.length && borradoCompletado === false) {
                                            this.ejecutarDeleteCategoria(currentIDCategory);
                                        }
                                    });
                                }
                            });
                        }
                    });

                }
            });
        }
    }

    render() {
        return (
            <div>
                <h1 className='timer_title noselect'>CATEGORÍAS</h1>
                <div className='content_box'>
                    {
                        this.state.categorias && (
                            this.state.categorias.length === 0 ? (
                                <p className='p_nonexist'>No existen categorías en este momento</p>
                            ) : (
                                this.state.categorias.map((categoria, index) => {
                                    return (
                                        <div className='box_categoria scroll' key={index} onClick={() => this.modifyCategory(index)}>
                                            <div className='box_categoria_target_time'>{this.transformMinutes(categoria.duracion, true)}</div>
                                            <div className='box_categoria_target noselect'>
                                                {categoria.categoria}
                                            </div>
                                        </div>
                                    )
                                })
                            )
                        )
                    }
                    {
                        this.state.token && (
                            <div className='box_categoria last_item' onClick={() => this.generateCategories()}>
                                <p className='box_categoria_target_plus noselect'>
                                    <img src={plusicon} alt="Icono más" className='plusicon'/>
                                </p>
                            </div>
                        )
                    }
                </div>
            </div>
        )
    }
}

export default Categorias;