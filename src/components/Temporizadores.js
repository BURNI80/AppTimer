import React, { Component } from 'react';
import plusicon from '../assets/plus.svg';

import Swal from 'sweetalert2';
import service from '../services/service';
import './css/Temporizadores.css';
export class Temporizadores extends Component {
    currentService = new service();
    state = {
        temporizadores : [],
        categorias : [],
        token : false
    }

    componentDidMount = () => {
        this.loadTimers();
        this.loadCategories();
        this.setState({
            token : (localStorage.getItem("token") !== null)
        });
    }

    loadTimers = () => {
        this.currentService.getTemporizadores().then((result_temporizadores) => {
            result_temporizadores.sort(function (a, b) {
                return a.inicio.substring(a.inicio.length - 8).localeCompare(b.inicio.substring(a.inicio.length - 8));
            }); // Se han ordenado los timers por hora más temprana -> hora más tarde
            this.setState({
                temporizadores : result_temporizadores
            });
        });
    }

    loadCategories = () => {
        this.currentService.getCategorias().then((result_categorias) => {
            this.setState({
                categorias : result_categorias
            });
        });
    }

    getOptionsCategories = (idCategoria) => {
        var auxiliar = '';
        this.state.categorias.forEach((catego) => {
            auxiliar += '<option value="' + catego.idCategoria + '" ';

            if (idCategoria !== -1) {
                if (catego.idCategoria === idCategoria) {
                    auxiliar += 'selected';
                }
            }

            auxiliar += '>' + 
                            catego.categoria +
                        '</option>';
        })
        return auxiliar;
    }

    getDate = () => { // Obtenemos la fecha actual en formato YYYY-mm-dd
        return new Date().toISOString().split('T')[0];
    }
    
    generateTimer = () => { 
        new Swal({
            title: 'Nuevo temporizador',
            html:
                '<label for="swal-input1">Fecha y hora de inicio</label></br>' +
                '<input type="date" id="swal-input3" class="swal2-input" value="' + this.getDate() + '" min="' + this.getDate() + 
                '" style="margin:5px 0 0 0;">' +
                '<input type="time" id="swal-input1" class="swal2-input" style="margin:0;"/>' +

                '<p id="error_1" style="display:none; color:red;">Por favor, inserte una hora válida</p></br>' +

                '<label for="swal-input2">Categoría</label></br>' +
                '<select  id="swal-input2" class="swal2-input" style="margin-top:5px; width:80%;">' + 
                this.getOptionsCategories(-1) + 
                '</select>',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Aceptar",
            confirmButtonColor: '#2C4D9E',
            cancelButtonText: "Cancelar",
            preConfirm: () => {
                if (document.getElementById('swal-input1').value === "") {
                    document.getElementById('error_1').style.display = 'inline-block';
                    return false;
                } else {
                    return [
                        document.getElementById('swal-input1').value,
                        document.getElementById('swal-input2').value,
                        document.getElementById('swal-input3').value
                    ]
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                var newTimer = {
                    idTemporizador : 0,
                    inicio : result.value[2] + "T" + result.value[0] +":00",
                    idCategoria : result.value[1],
                    pausa : false
                }
                if (this.state.temporizadores.length === 0) {
                    this.currentService.postTemporizador(newTimer).then(() => {
                        Swal.fire({
                            title: 'Temporizador creado',
                            text: 'Se ha creado el nuevo temporizador en la base de datos',
                            icon: 'success',
                            confirmButtonColor: "#2C4D9E"
                        });
                        this.loadTimers();
                    }); 
                } else {
                    var counter = 0, correcto = true;
                    var compare_init = this.getInicio(newTimer.inicio);
                    var compare_end = this.getFinal(Number.parseInt(newTimer.idCategoria), newTimer.inicio);
                    var tcompare_init = this.transformDuration(compare_init);
                    var tcompare_end = this.transformDuration(compare_end);
                    this.state.temporizadores.forEach((tempo) => {
                        counter ++; // Esta variable avisará a la función asyn. para que se ejecute cuando termine el forEach
                        var init = this.transformDuration(this.getInicio(tempo.inicio));                    // Inicio en int
                        var end = this.transformDuration(this.getFinal(tempo.idCategoria, tempo.inicio));   // Final en int
    
                        // CASOS NO COMPATIBLES ================================================================
                        if (tcompare_init === init) { correcto = false; }                        // Mismo inicio
                        if (tcompare_init > init && tcompare_init < end) { correcto = false; }   // Valor entre otro rango
                        if (tcompare_end > init && tcompare_end <= end) { correcto = false; }    // Valor entre otro rango
    
                        if (counter === this.state.temporizadores.length) { // Se ejecuta el post al acabar el recorrido de timers
                            if (correcto) { // En este caso no hay conflicto con otros timers
                                this.currentService.postTemporizador(newTimer).then(() => {
                                    Swal.fire({
                                        title: 'Temporizador creado',
                                        text: 'Se ha creado el nuevo temporizador en la base de datos',
                                        icon: 'success',
                                        confirmButtonColor: "#2C4D9E"
                                    });
                                    this.loadTimers();
                                });                                                            
                            } else { // Existe conflicto con otros timers (Mismo init o valor entre rangos)
                                Swal.fire({
                                    title: 'Hora no válida',
                                    text: 'En el rango proporcionado por el usuario (' + compare_init + ' - ' + compare_end + ') ya existe otro temporizador activo.',
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
                }
            }
        });
    }

    modifyTimer = (index) => {
        if (this.state.token) {
            new Swal({
                title: 'Modificar temporizador',
                html:
                    '<label for="swal-input1">Hora de inicio</label></br>' +
                    '<input type="date" id="swal-input3" class="swal2-input" value="' + this.state.temporizadores[index].inicio.split('T')[0] +
                     '" min="' + this.getDate() + 
                    '" style="margin:5px 0 0 0;">' +
                    '<input type="time" id="swal-input1" class="swal2-input" style="margin:0;" value="' + 
                    this.getInicio(this.state.temporizadores[index].inicio) + 
                    '"/></br>' +
                    '<p id="error_1" style="display:none; color:red;">Por favor, inserte una hora válida</p></br>' +
                    '<label for="swal-input2">Categoría</label></br>' +
                    '<select  id="swal-input2" class="swal2-input" style="margin-top:5px; width:70%;">' + 
                    this.getOptionsCategories(this.state.temporizadores[index].idCategoria) + 
                    '</select>',
                focusConfirm: false,
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: "Guardar temporizador",
                confirmButtonColor: "#2C4D9E",
                denyButtonText: "Eliminar temporizador",
                denyButtonColor: "#FF0000",
                cancelButtonText: "Cancelar",
                preConfirm: () => {
                    if (document.getElementById('swal-input1').value === "") {
                        document.getElementById('error_1').style.display = 'inline-block';
                        return false;
                    } else {
                        return [
                            document.getElementById('swal-input1').value,
                            document.getElementById('swal-input2').value,
                            document.getElementById('swal-input3').value
                        ]
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) { // Modificar temporizador
                    var newTimer = {
                        idTemporizador : this.state.temporizadores[index].idTemporizador,
                        inicio : result.value[2] + "T" + result.value[0] +":00",
                        idCategoria : result.value[1],
                        pausa : false
                    }
                    if (this.state.temporizadores.length === 0) {
                        this.currentService.putTemporizador(newTimer).then(() => {
                            Swal.fire({
                                title: 'Temporizador modificado',
                                text: 'Se ha modificado el temporizador de la base de datos',
                                icon: 'success',
                                confirmButtonColor: "#2C4D9E"
                            });
                            this.loadTimers();
                        }); 
                    } else {
                        var counter = 0, correcto = true;
                        var compare_init = this.getInicio(newTimer.inicio);
                        var compare_end = this.getFinal(Number.parseInt(newTimer.idCategoria), newTimer.inicio);
                        var tcompare_init = this.transformDuration(compare_init);
                        var tcompare_end = this.transformDuration(compare_end);
                        this.state.temporizadores.forEach((tempo) => {
                            counter ++; // Esta variable avisará a la función asyn. para que se ejecute cuando termine el forEach
                            if (newTimer.idTemporizador !== tempo.idTemporizador) {
                                var init = this.transformDuration(this.getInicio(tempo.inicio));                    // Inicio en int
                                var end = this.transformDuration(this.getFinal(tempo.idCategoria, tempo.inicio));   // Final en int
            
                                // CASOS NO COMPATIBLES ================================================================
                                if (tcompare_init === init) { correcto = false; }                        // Mismo inicio
                                if (tcompare_init > init && tcompare_init < end) { correcto = false; }   // Valor entre otro rango
                                if (tcompare_end > init && tcompare_end <= end) { correcto = false; }    // Valor entre otro rango
                            }
        
                            if (counter === this.state.temporizadores.length) { // Se ejecuta el post al acabar el recorrido de timers
                                if (correcto) { // En este caso no hay conflicto con otros timers
                                    this.currentService.putTemporizador(newTimer).then(() => {
                                        Swal.fire({
                                            title: 'Temporizador modificado',
                                            text: 'Se ha modificado el temporizador de la base de datos',
                                            icon: 'success',
                                            confirmButtonColor: "#2C4D9E"
                                        });
                                        this.loadTimers();
                                    });                                                      
                                } else { // Existe conflicto con otros timers (Mismo init o valor entre rangos)
                                    Swal.fire({
                                        title: 'Hora no válida',
                                        text: 'En el rango proporcionado por el usuario (' + compare_init + ' - ' + compare_end + ') ya existe otro temporizador activo.',
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
                    }
                }
                if (result.isDenied) { // Eliminar temporizador
                    Swal.fire({
                        title: '¿Estás segur@?',
                        text: "Al eliminar este temporizador también se eliminarán los registros de empresas asignadas al mismo",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#2C4D9E',
                        cancelButtonColor: '#FF0000',
                        confirmButtonText: 'Sí, estoy segur@',
                        cancelButtonText: 'No, cancelar'
                      }).then((result) => {
                        if (result.isConfirmed) {
                            var currentID = this.state.temporizadores[index].idTemporizador;
                            this.currentService.getTES().then((result_tes) => {
                                if (result_tes.length === 0) { // No existen TES, borramos directamente
                                    this.currentService.deleteTemporizador(currentID).then(() => {
                                        Swal.fire({
                                            title: 'Temporizador eliminado',
                                            text: 'Se ha eliminado el temporizador de la base de datos',
                                            icon: 'success',
                                            confirmButtonColor: "#2C4D9E"
                                        });
                                        this.loadTimers();
                                    });
                                } else { // Existen TES, realizaremos una revisión
                                    var counter = 0;
                                    result_tes.forEach(registro => {
                                        counter++;
                                        if (registro.idTimer === currentID) {
                                            this.currentService.deleteTES(registro.id);
                                        }
                                        if (counter === result_tes.length) {
                                            this.currentService.deleteTemporizador(currentID).then(() => {
                                                Swal.fire({
                                                    title: 'Temporizador eliminado',
                                                    text: 'Se ha eliminado el temporizador de la base de datos',
                                                    icon: 'success',
                                                    confirmButtonColor: "#2C4D9E"
                                                });
                                                this.loadTimers();
                                            });
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
    
    getNameCategory = (idCategoria) => {
        var res = "";
        this.state.categorias.forEach(element => {
            if (element.idCategoria === idCategoria) {
                res = element.categoria;
            }
        });
        return res;
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
            return ((hours === 0)? "" : (hours + "h ")) + minutes + " min";  
        } else {
            return hours.toString().padStart(2,0) + ":" + minutes.toString().padStart(2,0);  
        }
    }

    deleteAll = () => {
        Swal.fire({
            title: "¿Está segur@?",
            text: "Se eliminarán todos los temporizadores de la base de datos, así como " + 
                  "los correspondientes registros de empresas / salas. Está acción no se puede revertir.",
            icon: "warning",
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: "Sí, estoy segur@",
            confirmButtonColor: "#FF0000",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                this.currentService.deleteAllTimers().then((result_dAll) => {
                    this.loadTimers();
                    Swal.fire({
                        title: "Borrado completado",
                        text: "Todos los temporizadores han sido eliminados correctamente",
                        icon: "success",
                        confirmButtonColor: "#2C4D9E"
                    });
                });
            }
        });
    }

    render() {
        return (
            <div>
                <h1 className='timer_title noselect'>TEMPORIZADORES</h1>
                <div className='content_box'>
                    {
                        this.state.temporizadores.length !== 0 && this.state.token && (
                            <button className='button_deleteAll' onClick={ () => this.deleteAll()}>
                                Eliminar todos
                            </button>
                        )
                    }
                    {
                        this.state.temporizadores.length === 0 ? (
                            <p className='p_nonexist'>No existen temporizadores en este momento</p>
                        ) : (
                            this.state.temporizadores.map((tempo, index) => {
                                return (
                                    <div className='box_temporizador' key={index} onClick={() => this.modifyTimer(index)}>
                                        <div className='box_temporizador_target_time_init noselect'>
                                            <p className='target_text'>{this.getInicio(tempo.inicio)}</p>
                                        </div>
                                        <div className='box_temporizador_target noselect'>
                                            <p className='target_text'>{this.getNameCategory(tempo.idCategoria)}</p>
                                        </div>
                                        <div className='box_temporizador_target_time_end noselect'>
                                            <p className='target_text'>{this.getFinal(tempo.idCategoria, tempo.inicio)}</p>
                                        </div>
                                    </div>
                                )
                            })
                        )
                    }
                    {
                        this.state.token && (
                            <div className='box_temporizador' onClick={() => this.generateTimer()}>
                                <div></div> {/* No tocar */}
                                <img src={plusicon} alt="Icono más" className='plusicon noselect'/>
                            </div>
                        )
                    }
                </div>
            </div>
        )
    }
}

export default Temporizadores;