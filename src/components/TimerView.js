import React, { Component } from 'react';
import './css/TimerView.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';

import Global from '../Global';
import service from '../services/service';
import io from "socket.io-client";

/* SUBCOMPONENTES */
import SalaPopUp from './SalaPopUp';
import Tiempo from './Tiempo';
import Swal from 'sweetalert2';
import HorarioEmpresaPopUp from './HorarioActualEmpresaPopUp';

const socket = io(Global.SocketUrl, {
    withCredentials: true,
});

export class TimerView extends Component {
    currentService = new service();

    state = {
        time : 0,                // Almacena el tiempo principal que se consume y se muestra
        sala_id : null,          // Almacena el id de la sala actual
        sala_nombre : null,      // Almacena el nombre de la sala actual
        timer_id : 1,            // Almacena el id del temporizador que aparece en pantalla
        empresa_id : null,
        empresa_nombre : null,
        next_timers : [],
        next_c1 : "",
        next_e1 : "",
        next_c2 : "",
        next_e2 : "",
        statusSalaPopUp : false, // Almacena la aparición o no del PopUp de selección de sala
        checkCompany : false,
        next_timers_ordenados : [],
        token : false,
        eventosActualesEmpresa: null,
        showHorariosEmpresa: false
    }

    componentDidMount = () => {
        this.setState({
            token : (localStorage.getItem("token") !== null)
        });

        this.currentService.getSalas().then((result) => {
            this.changeRoom(result[0].nombreSala, result[0].idSala);
        }); // Cargamos el nombre de la primera sala habilitada
        
        socket.on('envio', (num) => {
            var miCirculo = document.getElementById('theCircle');
            if (miCirculo !== null) {
                var caso = 0;
                if(num <= 180 && num > 60) { caso = 1; }
                if(num <= 60 && num > 3) { caso = 2; }
                if(num <= 3 && num > 0) { caso = 3; }
                switch (caso) {
                    case 1: 
                        miCirculo.classList.add("crcolor_180");
                        miCirculo.classList.remove("crcolor_60");
                        miCirculo.classList.remove("crcolor_3");
                        break;
                    case 2: 
                        miCirculo.classList.remove("crcolor_180");
                        miCirculo.classList.add("crcolor_60");
                        miCirculo.classList.remove("crcolor_3");
                        break;
                    case 3:
                        miCirculo.classList.remove("crcolor_180");
                        miCirculo.classList.remove("crcolor_60");
                        miCirculo.classList.add("crcolor_3");
                        break;
                    default: 
                        miCirculo.classList.remove("crcolor_180");
                        miCirculo.classList.remove("crcolor_60");
                        miCirculo.classList.remove("crcolor_3");
                    break;
                }
            }
        });

        socket.on('timerID', (idTimer) => {
            this.setState({
                timer_id : idTimer
            }, () => {
                this.setState({
                    next_timers : this.ordenarTimers(this.state.next_timers_ordenados)
                }, () => {
                    if (this.state.next_timers.length > 0) {
                        this.getCategoryName(this.state.next_timers[0].idCategoria, true);
                        this.getLineName(this.state.next_timers[0].idTemporizador, true);                        
                    }
        
                    if (this.state.next_timers.length > 1) {
                        this.getCategoryName(this.state.next_timers[1].idCategoria, false);
                        this.getLineName(this.state.next_timers[1].idTemporizador, false);                        
                    }
                    this.checkCompany();
                });
            });
        });
    }

    changeStatusSalaPopUp = () => {
        this.setState({
            statusSalaPopUp : !this.state.statusSalaPopUp
        });
    }

    changeRoom = (name, id) => {
        this.setState({
            sala_id : id,
            sala_nombre : name
        }, () => {
            this.currentService.getTemporizadores().then((result) => {
                this.setState({
                    next_timers_ordenados : result
                });
            });
        });
    }

    checkCompany = () => { // Método para comprobar si hay empresa en el momento actual (tiempos_empresas_salas)
        var res = false;
        this.currentService.getTES().then((result) => {
            result.forEach(element => {
                if (element.idSala === this.state.sala_id && element.idTimer === this.state.timer_id) {
                    res = true;
                    this.setState({
                        empresa_id : element.idEmpresa
                    }, () => {this.getCompanyName()});
                }
            });
        }).then(() => {
            this.setState({
                checkCompany : res
            });
        });
    }

    ordenarTimers(timers) {
        // First, filter out any timer objects that are in the past
        const currentDate = new Date();
        const filteredTimers = timers.filter(timer => {
            const startTime = new Date(timer.inicio);
            return startTime >= currentDate;
        });
      
        // Then, sort the remaining timer objects by start time
        const sortedTimers = filteredTimers.sort((a, b) => {
            const startTimeA = new Date(a.inicio);
            const startTimeB = new Date(b.inicio);
            return startTimeA - startTimeB;
        });
      
        return sortedTimers;
    }

    getCompanyName = () => {
        this.currentService.getEmpresa(this.state.empresa_id).then((result) => {
            this.setState({
                empresa_nombre : result.nombreEmpresa
            });
        });
    }

    getLineName = (identificador, lineaUno) => {
        this.currentService.getTES().then((result) => {
            var counter = 0, idCompany = null;
            result.forEach(element => {
                counter++;
                if (element.idSala === this.state.sala_id && element.idTimer === identificador) {
                    idCompany = element.idEmpresa;
                }
                if (counter === result.length) { // Una vez terminado el recuento, modificamos
                    if (idCompany !== null) {
                        this.currentService.getEmpresa(idCompany).then((result_2) => {
                            if (lineaUno) {
                                this.setState({ next_e1 : result_2.nombreEmpresa });
                            } else {
                                this.setState({ next_e2 : result_2.nombreEmpresa });
                            }
                        });
                    } else {
                        if (lineaUno) {
                            this.setState({ next_e1 : "" });
                        } else {
                            this.setState({ next_e2 : "" });
                        }
                    }
                }
            });
        });
    }

    getCategoryName = (identificador, lineaUno) => {
        this.currentService.getCategoria(identificador).then((result) => {
            if (lineaUno) {
                this.setState({ next_c1 : result.categoria });
            } else {
                this.setState({ next_c2 : result.categoria });
            }
        });
    }

    getNow = () => {
        var ahora = new Date(), hours = "", minutes = "";
        hours = ((ahora.getHours() < 10)? "0" : "") + ahora.getHours();
        minutes = ((ahora.getMinutes() < 10)? "0" : "") + ahora.getMinutes();
        return hours + ":" + minutes;
    }
    
    startEvent = () => {
        if (this.state.token) {
            Swal.fire({
                title: "¿Iniciar evento?",
                text: "El evento se iniciará a las " + this.getNow(),
                icon: "question",
                showConfirmButton: true,
                confirmButtonText: "Iniciar",
                confirmButtonColor: "#2C4D9E",
                showCancelButton: true,
                cancelButtonText: "Cancelar"
            }).then((result_start) => {
                if (result_start.isConfirmed) {
                    socket.emit("start");
                    window.location.reload(false);
                }
            });
        }
    }

    showTiemposActualesEmpresa = () => {
        this.setState({showHorariosEmpresa: true});
    }

    changeStatusHorarioEmpresaPopUp = () => {
        this.setState({showHorariosEmpresa: false});
    }

    render() {
        return (
            <div>
                {
                    this.state.statusSalaPopUp && (
                        <SalaPopUp changeStatusSalaPopUp={this.changeStatusSalaPopUp} changeRoom={this.changeRoom} />
                    )
                }
                {
                    this.state.showHorariosEmpresa && (
                        <HorarioEmpresaPopUp changeStatusHorarioEmpresaPopUp={this.changeStatusHorarioEmpresaPopUp} 
                        idempresa={this.state.empresa_id}/>
                    )
                } 
                <header>
                    <button className='mainsala noselect' onClick={ () => this.changeStatusSalaPopUp() }>
                        {this.state.sala_nombre}
                    </button>
                        {
                            this.state.checkCompany ? (
                                <p className='maincompany noselect' onClick={ () => this.showTiemposActualesEmpresa() }>
                                    <b>Está hablando:</b><br/><i>{this.state.empresa_nombre}</i>
                                </p>
                            ) : (
                                <p className='maincompany noselect'>
                                    <b>Descanso</b><br/><i>Ninguna empresa está hablando</i>
                                </p>
                            )
                        }
                </header>
                <div id="theCircle" className='maincircle mainshadow shadowcircle' onClick={() => this.startEvent()}>
                    <span className='valuecircle noselect'>
                        <Tiempo/>
                    </span>
                </div>
                {
                    this.state.next_timers.length > 0 ? (
                        <footer className='noselect'>
                            <b>Siguiente:</b>
                            <p>
                                <i>{this.state.next_e1}</i> ({this.state.next_c1}) 
                                 - {this.state.next_timers[0].inicio.substring(this.state.next_timers[0].inicio.length - 8)}
                            </p>
                            {
                                this.state.next_timers.length > 1 && (
                                    <p>
                                        <i>{this.state.next_e2}</i> ({this.state.next_c2})
                                        - {this.state.next_timers[1].inicio.substring(this.state.next_timers[1].inicio.length - 8)}
                                    </p>
                                )
                            }
                        </footer>
                    ) : (
                        <footer className='noselect'>
                            <b>Siguiente:</b>
                            <p>
                                <i>No existen más temporizadores registrados</i>
                            </p>
                        </footer>
                    )
                }
            </div>
        )
    }
}

export default TimerView;