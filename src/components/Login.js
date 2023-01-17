import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Login.css';
import { NavLink } from 'react-router-dom';

import service from '../services/service';
import Global from '../Global';
import Swal from 'sweetalert2';
import io from "socket.io-client";

const socket = io(Global.SocketUrl, {
    withCredentials: true,
});
export class Login extends Component {
    currentService = new service();

    userbox = React.createRef();
    passwordbox = React.createRef();

    state = {
        token : null
    }

    componentDidMount = () => {
        this.updateToken();
    }

    updateToken = () => {
        this.setState({
            token : localStorage.getItem("token")
        });
    }

    setLogin = (e) => {
        e.preventDefault();
        this.currentService.generateToken(this.userbox.current.value, this.passwordbox.current.value).then((result) => {
            localStorage.setItem("token", result.response);
            this.updateToken();
        });
    }

    signout = () => {
        localStorage.clear();
        this.setState({ token : null });
    }

    resetEmergency = () => {
        Swal.fire({
            title : "Reseteo de emergencia",
            html : "<p>Esta acción permite <b>resetear la base de datos</b> de la aplicación y " +
                   "<b>restaurar los temporizadores</b> en caso de que haya producido alguna <b>falla en el " +
                   "sistema.</b></p><p style='margin:0;'><b>El temporizador actual</b> (en el caso de que hubiese " +
                   "uno activo en este momento) <b>no se puede restaurar.</b> No obstante, una vez este finalice, " + 
                   "el resto de temporizadores habrán sido reseteados para continuar con su funcionamento normal.</p>" +
                   "<br/><p><b>¿Desea continuar con el reseteo de emergencia?</b></p>",
            icon : "warning",
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Sí, ejecutar reseteo",
            confirmButtonColor: "#FF0000",
            cancelButtonText: "No, cancelar",
            cancelButtonColor: "#2C4D9E",
        }).then((result) => {
            if (result.isConfirmed) {
                socket.emit("panic");
                Swal.fire({
                    title: 'Reseteo completado',
                    text: 'Los temporizadores han sido reseteados satisfactoriamente',
                    icon: 'success',
                    confirmButtonColor: "#2C4D9E"
                });
            }
        })
    }

    render() {
        return (
            <div>
                {
                    this.state.token === null && (
                        <form onSubmit={this.setLogin}>
                            <label htmlFor="userbox" className='form-label noselect'>Usuario</label>
                            <input type="text" id='userbox' className='form-control' ref={this.userbox}/> 
                            <label htmlFor="passwordbox" className='form-label noselect mt-2'>Contraseña</label>
                            <input type="password" id='passwordbox' className='form-control' ref={this.passwordbox}/> 
                            <button className='buttonform'>
                                Iniciar sesión
                            </button>
                        </form>
                    )
                }
                {
                    this.state.token !== null && (
                        <div className='content_box_superuser'>
                            <NavLink to="/horario" className='button_superuser'>
                                Horario
                            </NavLink>
                            <NavLink to="/salas" className='button_superuser'>
                                Salas
                            </NavLink>
                            <NavLink to="/categorias" className='button_superuser'>
                                Categorías
                            </NavLink>
                            <NavLink to="/empresas" className='button_superuser'>
                                Empresas
                            </NavLink>
                            <NavLink to="/temporizadores" className='button_superuser'>
                                Temporizadores
                            </NavLink>
                            {/* <button id="btn_emergencia" className='button_superuser' onClick={() => this.resetEmergency()}>
                                Resetear Temporizadores
                            </button> */}
                        </div>
                    )
                }
                {
                    this.state.token !== null && (
                        <div className='content_box_superuser'>
                            <button className='buttonform' onClick={this.signout}>
                                Cerrar sesión
                            </button>
                        </div>
                    )
                }
            </div>
        )
    }
}

export default Login;