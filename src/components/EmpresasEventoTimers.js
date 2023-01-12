import React, { Component } from "react";

import service from "../services/service";
import "./css/Empresas.css";
import "./css/EmpresasEventoTimers.css";

export default class EmpresasEventoTimers extends Component {
    currentService = new service();
    selectSeeker = React.createRef();

    state = {
        empresas: [],
        categorias: [],
        token: false,
        empresatiempos: null,
        eventosActualesEmpresa: null,
        nombreEmpresa: null
    };

    componentDidMount = () => {
        this.loadEmpresasTimer();
        this.loadcategories();
        this.setState({
            token: localStorage.getItem("token") !== null,
        });
    };

    /* ================================ LOADS ================================ */
    loadEmpresasTimer = () => {
        this.currentService.getEmpresasTimers().then((result) => {
            this.setState({
                empresas: result,
            }, () => {
                if (this.state.empresas.length > 0) {
                    this.findTiemposActualesEmpresa(this.state.empresas[0].idEmpresa);
                }
            });
        });
    };

    loadcategories = () => {
        this.currentService.getCategorias().then((result) => {
            this.setState({
                categorias : result
            });
        });
    }
    /* ================================ LOADS ================================ */
    
    /* =============================== SEEKERS =============================== */
    findTiemposEmpresa = (idempresa) => {
        this.currentService.findTimersEventosEmpresa(idempresa).then((result) => {
            // console.log(result[0]);
            this.setState({
                empresatiempos: result[0],
            });
            this.findTiemposActualesEmpresa(idempresa);      
        });
    };
    
    // MÉTODO PARA RECUPERAR EL EVENTO ACTUAL Y EL SIGUIENTE DE UNA EMPRESA
    findTiemposActualesEmpresa = (idempresa) => {
        this.currentService.findTimersActualesEmpresa(idempresa).then((result) => {
            this.setState({
                eventosActualesEmpresa: result,
                nombreEmpresa: result[0].empresa
            });
        });
    };
    /* =============================== SEEKERS =============================== */

    /* ========================== FORMATEO DE TIEMPO ========================== */
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
        if (hours > 0) { hours = hours * 60; }
        return hours + minutes;
    }

    transformMinutes = (duration) => { // Pasar de 75 a 01:15 (string)
        var hours = Math.floor(duration / 60);  
        var minutes = duration % 60;
        return hours.toString().padStart(2,0) + ":" + minutes.toString().padStart(2,0);  
    }
    /* ========================== FORMATEO DE TIEMPO ========================== */

    render() {
        return (
            <div className="content_box">
                <h1 className="timer_title_max noselect">SEGUIMIENTO EMPRESAS</h1>
                {
                    this.state.empresas && (
                        this.state.empresas.length === 0 ? (
                            <p className="p_nonexist">No existen empresas asignadas en este momento</p>
                        ) : (
                            <div className="companies_seeker_box">
                                <select id="companies_seeker" className="form-select" ref={this.selectSeeker}
                                        onChange={() => this.findTiemposActualesEmpresa(this.selectSeeker.current.value)}>
                                    {
                                        this.state.empresas.map((empresa, index) => {
                                            return (
                                                <option value={empresa.idEmpresa} key={index}>
                                                    {empresa.nombreEmpresa}
                                                </option>
                                            )
                                        })
                                    }
                                </select>
                            </div>
                        )
                    )
                }
                {
                    this.state.eventosActualesEmpresa && (
                        <div className="schedule_table_box">
                            <table className="schedule_table noselect">
                                <thead>
                                    <tr className="schedule_header">
                                        <th></th>
                                        <th colSpan={4}>
                                            <p id="theader_schedule_p">
                                                { this.state.nombreEmpresa }
                                            </p>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.eventosActualesEmpresa.map((evento, index) => {
                                            var check = 2;
                                            var catcolspan = check ? 1 : 2;
                                            var inicio = this.getInicio(evento.inicioTimer);
                                            return (
                                                <tr key={index}>
                                                    <td>{inicio}<br/>{this.getFinal(evento.idCategoria, inicio)}</td>
                                                    <td colSpan={catcolspan} className='schedule_col scroll' style={{"backgroundColor":"#F0F0F0"}}>
                                                            {evento.sala}
                                                    </td>    
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                    )
                }
            </div>
        );
    }
}
