import React, { Component } from "react";
import "./css/SalaPopUp.css";
import "./css/Empresas.css";
import service from "../services/service";
import Card from "react-bootstrap/Card";

export class HorarioEmpresaPopUp extends Component {
    currentService = new service();
    state = {
        eventosActualesEmpresa: null,
        nombreEmpresa: "",
        siguienteEventoEmpresa: null,
    };

    componentDidMount = () => {
        // console.log("Estoy montando!!!");
        this.findTiemposActualesEmpresa();
    };

    componentDidUpdate = (oldProps) => {
        if (oldProps.idempresa !== this.props.idempresa){ this.findTiemposActualesEmpresa(); } 
    }

    // CODIGO NUEVO
    findTiemposActualesEmpresa = () => {
    this.currentService
        .findTimersActualesEmpresa(this.props.idempresa)
        .then((result) => {
            // console.log(result);
            // console.log("Número de eventos: " + result.length);
            var indiceEvento = 0;
            if (result.length > 1){
                indiceEvento = 1;
            }
            this.setState({
                eventosActualesEmpresa: result,
                siguienteEventoEmpresa: result[indiceEvento],
                nombreEmpresa: result[0].empresa
            });
        });
    };

    exit = () => {
        this.props.changeStatusHorarioEmpresaPopUp();
    };

    getInicio = (string_init) => {
        var time = new Date(string_init);
        var time_string = time.toTimeString().split(" ")[0];
        return time_string.substring(0, time_string.length - 3);
    };

    getFinal = (duracion, inicio) => {
        var res = "";
        var miInicio = this.getInicio(inicio);
        // console.log("MI Inicio: " + miInicio);
        // console.log("IdCat: " + duracion);
        // console.log("Inicio: " + inicio);
        var inicio_min = this.transformDuration(miInicio);
        // console.log("Inicio min: " + inicio_min);
        inicio_min += duracion;
        res = this.transformMinutes(inicio_min);
        return res;
    };

    transformDuration = (duration) => { // Pasar de 01:15 a 75 (min - integer)
        var time = duration.split(":");
        var hours = Number.parseInt(time[0]);
        var minutes = Number.parseInt(time[1]);
        if (hours > 0) {
            hours = hours * 60;
        }
        return hours + minutes;
    };

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
      <div className="box-component">
        <div className="box-popup">
          <span className="close-icon" onClick={() => this.exit()}></span>
          {
            this.state.eventosActualesEmpresa ? (
                <div>
                    <Card className="text-center" border="primary">
                        <Card.Header>Horario {this.state.nombreEmpresa}</Card.Header>
                        <Card.Body>
                            <Card.Title>
                                Sala {this.state.siguienteEventoEmpresa.sala}
                            </Card.Title>
                            <Card.Text>
                                <p>Siguiente charla</p>
                                <h1 className="text-danger">
                                    Inicio: {this.getInicio(this.state.siguienteEventoEmpresa.inicioTimer)}
                                </h1>
                            </Card.Text>
                        </Card.Body>
                        <Card.Footer className="text-muted">
                        Fin de charla: {this.getFinal(this.state.siguienteEventoEmpresa.duracion
                            , this.state.siguienteEventoEmpresa.inicioTimer)}
                        </Card.Footer>
                    </Card>
                </div>
            ) : (
                <div>
                    <Card className="text-center">
                        <Card.Header>No hay siguientes charlas</Card.Header>
                        <Card.Body>
                            <Card.Title>Sin horarios</Card.Title>
                            <Card.Text>
                                Las charlas de la empresa han finalizado
                            </Card.Text>
                        </Card.Body>
                        <Card.Footer className="text-muted">Información</Card.Footer>
                    </Card>
                </div>
            )
          }
        </div>
      </div>
    );
  }
}

export default HorarioEmpresaPopUp;
