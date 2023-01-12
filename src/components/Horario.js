import React, { Component } from 'react';
import './css/Horario.css';

import Swal from 'sweetalert2';
import service from '../services/service';

import plusicon from '../assets/plus.svg';
import subicon from '../assets/sub.svg';

export class Horario extends Component {
    currentService = new service();

    state = {
        temporizadores : null,
        categorias : null,
        empresas : null,
        tiempos_empresas_salas : null,
        salas : null,
        sala_actual : 0,
        edit_mode : false,
        token : false
    }

    componentDidMount = () => {
        this.loadRooms();
        this.loadTimers();
        this.loadCategories();
        this.loadCompanies();
        this.loadTiemposEmpresasSalas();
        this.setState({
            token : (localStorage.getItem("token") !== null)
        });
    }

    loadRooms = () => {
        this.currentService.getSalas().then((result_salas) => {
            this.setState({
                salas : result_salas     
            }, () => {
                this.changeRoom(0);
            });
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

    loadCompanies = () => {
        this.currentService.getEmpresas().then((result_empresas) => {
            this.setState({
                empresas : result_empresas      
            });            
        });
    }

    changeRoom = (index) => {
        var auxiliar = this.state.sala_actual + index;
        
        if (auxiliar < 0) {
            auxiliar = this.state.salas.length - 1;
        } 
        
        if (auxiliar >= this.state.salas.length) {
            auxiliar = 0;
        }

        this.setState({
            sala_actual : auxiliar
        });
    }

    loadTiemposEmpresasSalas = () => {
        this.currentService.getTES().then((result_tes) => {
            this.setState({
                tiempos_empresas_salas : result_tes
            });
        });
    }
    
    getCompany = (idtimer) => {
        var res = "";
        if (this.state.tiempos_empresas_salas && this.state.empresas) {
            this.state.tiempos_empresas_salas.forEach(registro => {
                if (registro.idTimer === idtimer && registro.idSala === this.state.salas[this.state.sala_actual].idSala) {
                    this.state.empresas.forEach(empresa => {
                        if (empresa.idEmpresa === registro.idEmpresa) {
                            res = empresa.nombreEmpresa;
                        }
                    });
                }
            });
        }
        return res;
    }

    getCategory = (idcat) => {
        var res = "";
        if (this.state.categorias) {
            this.state.categorias.forEach(element => {
                if (element.idCategoria === idcat) {
                    res = element.categoria;
                }
            });
        }
        return res;
    }

    checkTimeCompanyRooms = (idtimer) => {
        var existe = false;
        if (this.state.tiempos_empresas_salas) {
            this.state.tiempos_empresas_salas.forEach(element => {
                if (element.idTimer === idtimer && element.idSala === this.state.salas[this.state.sala_actual].idSala) {
                    existe = true;
                }
            });
        }
        return existe;
    }

    changeMode = () => {
        this.setState({
            edit_mode : !this.state.edit_mode
        }, () => {
            document.getElementById("button_edit_schedule").innerText = (this.state.edit_mode) ? "Volver" : "Editar empresas";
        })
    }

    getOptionsCompanies = () => {
        var auxiliar = "";
        if (this.state.empresas) {
            this.state.empresas.forEach(company => {
                auxiliar += '<option value="' + company.idEmpresa + '">' + 
                                company.nombreEmpresa +
                            '</option>';
            });    
        }
        return auxiliar;
    }

    getExplication = (newRegister) => {
        var empresa = "";
        if (this.state.empresas) {
            this.state.empresas.forEach(company => {
                if (company.idEmpresa === newRegister.idEmpresa) {
                    empresa = company.nombreEmpresa;
                }
            });    
        }

        var sala = "";
        if (this.state.salas) {
            this.state.salas.forEach(room => {
                if (room.idSala === newRegister.idSala) {
                    sala = room.nombreSala;
                }
            });    
        }

        var inicio = "";
        if (this.state.temporizadores) {
            this.state.temporizadores.forEach(timer => {
                if (timer.idTemporizador === newRegister.idTimer) {
                    inicio = this.getInicio(timer.inicio);
                }
            });    
        }
        return "'" + empresa + "' en la sala '" + sala + "' a las " + inicio;
    }

    createTES = (index) => {
        new Swal({
            title: 'Asignar empresa',
            html:
                '<label for="swal-input1">Empresa</label></br>' +
                '<select  id="swal-input1" class="swal2-input" style="margin-top:5px; width: 70%;">' + 
                    this.getOptionsCompanies() + 
                '</select>',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Aceptar",
            confirmButtonColor: '#2C4D9E',
            cancelButtonText: "Cancelar",
            preConfirm: () => {
                return [
                    document.getElementById('swal-input1').value
                ]
            }
        }).then((result) => {
            if (result.isConfirmed) {
                var newRegister = {
                    id : 0,
                    idTimer : this.state.temporizadores[index].idTemporizador,
                    idEmpresa : Number.parseInt(result.value[0]),
                    idSala : this.state.salas[this.state.sala_actual].idSala,
                    idEvento : 1
                }
                new Swal({
                    title: '¿Datos correctos?',
                    text: this.getExplication(newRegister),
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sí, guardar',
                    cancelButtonText: 'No, cancelar'
                }).then((subresult) => {
                    if (subresult.isConfirmed) {
                        this.currentService.postTES(newRegister).then((result_tes_2) => {
                            Swal.fire({
                                title: 'Empresa asignada',
                                text: 'Se ha asignado una empresa a este momento',
                                icon: 'success',
                                confirmButtonColor: "#2C4D9E"
                            });
                            this.loadTiemposEmpresasSalas();
                        });
                    }
                });
            }
        });
    }

    deleteTES = (idtimer) => {
        var idTes = -1;
        if (this.state.tiempos_empresas_salas) {
            this.state.tiempos_empresas_salas.forEach((registro, index) => {
                if (registro.idTimer === idtimer && registro.idSala === this.state.salas[this.state.sala_actual].idSala) {
                    idTes = registro.id;
                }    
            });
            new Swal({
                title: 'Quitar empresa',
                text: "Se desasignará la empresa del temporizador seleccionado.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.isConfirmed) {
                    this.currentService.deleteTES(idTes).then((result_tes) => {
                        Swal.fire({
                            title: 'Empresa desasignada',
                            text: 'Ya no existe una empresa asignada a este momento',
                            icon: 'success',
                            confirmButtonColor: "#2C4D9E"
                        });
                        this.loadTiemposEmpresasSalas();
                    })
                }
            });
        }   
    }

    getInicio = (string_init) => {
        var time = new Date(string_init);
        var time_string = time.toTimeString().split(' ')[0];
        return time_string.substring(0, time_string.length - 3);
    }

    getFinal = (idcat, inicio) => {
        var res = "";
        if (this.state.categorias) {
            var inicio_min = this.transformDuration(inicio);
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

    render() {
        return (
            <div>
                <h1 className='timer_title noselect'>HORARIO</h1>
                {
                    this.state.token && (
                        <button id="button_edit_schedule" className='button_edit_schedule' onClick={() => this.changeMode()}>
                            Editar empresas
                        </button>
                    )
                }
                <div className='schedule_table_box'>
                    <table className='schedule_table noselect'>
                        <thead>
                            <tr className='schedule_header'>
                                <th></th>
                                <th colSpan={4}>
                                    <div id='theader_schedule'>
                                        <button className='schedule_buttons_rooms' onClick={() => this.changeRoom(-1)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-arrow-left-circle-fill" viewBox="0 0 16 16">
                                                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.5 7.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z"/>
                                            </svg>
                                        </button>
                                        {
                                            this.state.sala_actual >= 0 && this.state.salas && (
                                                <p id='theader_schedule_p'>
                                                    {this.state.salas[this.state.sala_actual].nombreSala}
                                                </p>
                                            )
                                        }
                                        <button className='schedule_buttons_rooms' onClick={() => this.changeRoom(1)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-arrow-right-circle-fill" viewBox="0 0 16 16">
                                                <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z"/>
                                            </svg>
                                        </button>                                        
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.temporizadores && this.state.salas && (
                                    this.state.temporizadores.map((tempo, index) => {
                                        var check = this.checkTimeCompanyRooms(tempo.idTemporizador);
                                        var catcolspan = check ? 1 : 2;
                                        var inicio = this.getInicio(tempo.inicio);
                                        return (
                                            <tr key={index}>
                                                <td>{inicio}<br/>{this.getFinal(tempo.idCategoria, inicio)}</td>
                                                {
                                                    this.state.edit_mode ? (
                                                        <td className='schedule_col scroll' colSpan={2}>
                                                            {
                                                                check ? (
                                                                    <div className='company_edit_box'>
                                                                        <button className='company_edit_box_target_sub' onClick={() => this.deleteTES(tempo.idTemporizador)}>
                                                                            <img src={subicon} className="addsub_icon" alt="Icono restar"/>
                                                                        </button>
                                                                        <div className='company_edit_box_target scroll'>
                                                                            <p className="target_text">
                                                                                {this.getCompany(tempo.idTemporizador)}
                                                                            </p>
                                                                        </div>
                                                                        <div className='inactive'>
                                                                            <img src={plusicon} className="addsub_icon" alt="Icono añadir"/>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className='company_edit_box'>
                                                                        <div className='inactive'>
                                                                            <img src={subicon} className="addsub_icon" alt="Icono restar"/>
                                                                        </div>
                                                                        <div className='company_edit_box_target scroll'>
                                                                            <p className="target_text">
                                                                                -
                                                                            </p>
                                                                        </div>
                                                                        <button className='company_edit_box_target_add' onClick={() => this.createTES(index)}>
                                                                            <img src={plusicon} className="addsub_icon" alt="Icono añadir"/>
                                                                        </button>
                                                                    </div>
                                                                )
                                                            }
                                                        </td>
                                                    ) : (
                                                        check && (
                                                            <td className='schedule_col scroll' style={{"fontWeight":"bold"}}>
                                                                {this.getCompany(tempo.idTemporizador)}
                                                            </td>
                                                        )
                                                    )
                                                }
                                                {
                                                    !this.state.edit_mode && (
                                                        <td colSpan={catcolspan} className='schedule_col scroll' style={{"backgroundColor":"#F0F0F0"}}>
                                                            {this.getCategory(tempo.idCategoria)}
                                                        </td>    
                                                    )
                                                }
                                            </tr>
                                        )
                                    })
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

export default Horario;