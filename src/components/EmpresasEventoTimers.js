import React, { Component } from "react";
import plusicon from "../assets/plus.svg";

import Swal from "sweetalert2";
import service from "../services/service";
import "./css/Empresas.css";

export default class EmpresasEventoTimers extends Component {
  currentService = new service();

  state = {
    empresas: [],
    token: false,
    empresatiempos: null,
    eventosActualesEmpresa: null,
    nombreEmpresa: null
  };

  componentDidMount = () => {
    this.loadEmpresasTimer();
    this.setState({
      token: localStorage.getItem("token") !== null,
    });
  };

  loadEmpresasTimer = () => {
    this.currentService.getEmpresasTimers().then((result) => {
      this.setState({
        empresas: result,
      });
    });
  };

  findTiemposEmpresa = (idempresa) => {
    this.currentService.findTimersEventosEmpresa(idempresa).then((result) => {
      console.log(result[0]);
      this.setState({
        empresatiempos: result[0],
      });
      this.findTiemposActualesEmpresa(idempresa);      
    });
  };

  //METODO PARA RECUPERAR EL EVENTO ACTUAL 
  //Y EL SIGUIENTE DE UNA EMPRESA
  findTiemposActualesEmpresa = (idempresa) => {
    this.currentService.findTimersActualesEmpresa(idempresa).then((result) => {
      console.log(result);
      this.setState({
        eventosActualesEmpresa: result,
        nombreEmpresa: result[0].empresa
      });
    });
  };

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

  transformMinutes = (duracion, legend) => { // Pasar de 75 a 01:15 (string)
      if (duracion === 60) {
          return (legend)? "1h" : "01:00";
      } else if(duracion < 60) {
          return (legend)? (duracion + " min") : ("00:" + duracion.toString().padStart(2,0));
      } else {
          var hours = Math.floor(duracion / 60);  
          var minutes = duracion % 60;
          return (legend)? (hours + " h " + minutes + " min") : (hours.toString().padStart(2,0) + ":" + minutes.toString().padStart(2,0));  
      }
  }  

  render() {
    return (
      <div>
        <h1 className="timer_title noselect">SEGUIMIENTO EMPRESAS</h1>
        <div className="content_box">
          {this.state.empresas &&
            (this.state.empresas.length === 0 ? (
              <p>No existen empresas en este momento</p>
            ) : (
              this.state.empresas.map((empresa, index) => {
                return (
                  <div
                    className="box_empresa"
                    key={empresa.idEmpresa}
                    onClick={() => this.findTiemposActualesEmpresa(empresa.idEmpresa)}
                  >
                    <p className="box_empresa_target noselect">
                      {empresa.nombreEmpresa}
                    </p>
                  </div>
                );
              })
            ))}
        </div>
        {this.state.eventosActualesEmpresa &&
          (<div className="schedule_table_box">
                  <table className="schedule_table noselect">
                    <thead>
                      <tr className="schedule_header">
                        <th></th>
                        <th colSpan={4}>
                          <div id="theader_schedule">
                            <button
                              className="schedule_buttons_rooms"
                              onClick={() => this.changeRoom(-1)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                fill="currentColor"
                                className="bi bi-arrow-left-circle-fill"
                                viewBox="0 0 16 16"
                              >
                                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.5 7.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z" />
                              </svg>
                            </button>
                                <p id="theader_schedule_p">
                                  {
                                    this.state.nombreEmpresa
                                  }
                                </p>
                            <button
                              className="schedule_buttons_rooms"
                              onClick={() => this.changeRoom(1)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                fill="currentColor"
                                className="bi bi-arrow-right-circle-fill"
                                viewBox="0 0 16 16"
                              >
                                <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z" />
                              </svg>
                            </button>
                          </div>
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
          )}
      </div>
    );
  }
}
