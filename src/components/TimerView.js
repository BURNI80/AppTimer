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
        token : false
    }

    componentDidMount = () => {
        this.setState({
            token : (localStorage.getItem("token") !== null)
        });

        this.currentService.getSalas().then((result) => {
            this.changeRoom(result[0].nombreSala, result[0].idSala);
        }); // Cargamos el nombre de la primera sala habilitada

        // this.currentService.getTemporizadores().then((result) => {
        //     this.setState({
        //         next_timers_ordenados : result
        //     });
        // });
        
        socket.on('envio', (num) => {
            var caso = 0;
            if(num <= 180 && num > 60) {
                caso = 1;
            }

            if(num <= 60 && num > 3) {
                caso = 2;
            }

            if(num <= 3 && num > 0) {
                caso = 3;
            }
            switch (caso) {
                case 1: 
                    document.getElementById('theCircle').classList.add("crcolor_180");
                    document.getElementById('theCircle').classList.remove("crcolor_60");
                    document.getElementById('theCircle').classList.remove("crcolor_3");
                    break;
                case 2: 
                    document.getElementById('theCircle').classList.remove("crcolor_180");
                    document.getElementById('theCircle').classList.add("crcolor_60");
                    document.getElementById('theCircle').classList.remove("crcolor_3");
                    break;
                case 3:
                    document.getElementById('theCircle').classList.remove("crcolor_180");
                    document.getElementById('theCircle').classList.remove("crcolor_60");
                    document.getElementById('theCircle').classList.add("crcolor_3");
                    break;
                default: 
                    document.getElementById('theCircle').classList.remove("crcolor_180");
                    document.getElementById('theCircle').classList.remove("crcolor_60");
                    document.getElementById('theCircle').classList.remove("crcolor_3");
                break;
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

    render() {
        return (
            <div>
                {
                    this.state.statusSalaPopUp && (
                        <SalaPopUp changeStatusSalaPopUp={this.changeStatusSalaPopUp} changeRoom={this.changeRoom} />
                    )
                }
                <header>
                    <button className='mainsala noselect' onClick={ () => this.changeStatusSalaPopUp() }>
                        {this.state.sala_nombre}
                    </button>
                        {
                            this.state.checkCompany ? (
                                <p className='maincompany noselect'>
                                    <b>Está hablando:</b><br/><i>{this.state.empresa_nombre}</i>
                                </p>
                            ) : (
                                <p className='maincompany noselect'>
                                    <b>Descanso</b><br/><i>Ninguna empresa está hablando</i>
                                </p>
                            )
                        }
                </header>
                <div id="theCircle" className='maincircle mainshadow shadowcircle'>
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