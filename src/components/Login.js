import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './css/Login.css';
import { NavLink } from 'react-router-dom';

import service from '../services/service';

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

    render() {
        return (
            <div>
                {
                    this.state.token === null && (
                        <form onSubmit={this.setLogin}>
                            <label htmlFor="userbox" className='form-label noselect'>Usuario</label>
                            <input type="text" id='userbox' className='form-control' ref={this.userbox}/> 
                            <label htmlFor="passwordbox" className='form-label noselect mt-2'>Contraseña</label>
                            <input type="text" id='passwordbox' className='form-control' ref={this.passwordbox}/> 
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