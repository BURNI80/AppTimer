import React, { Component } from 'react';
import './css/MenuPopUp.css';

/* 
    En la medida de lo posible, trabajaremos con SVG para no cargar la App 
    con peso innecesario de imagenes para formas o iconos.
*/
import closeicon from '../assets/closeicon.svg';
import { NavLink } from 'react-router-dom';

export class MenuPopUp extends Component {

    exit = () => { this.props.showHiddenMenu(); } // Este método llama al showHiddenMenu del componente padre (menu)
    
    render() {
        return (
            <div className='menupopup-box-component' id='sidemenu'>
                <button className='menupopup-back' onClick={this.exit}>
                    <img src={closeicon} alt="Icono de cierre"/>
                </button>
                <div className='menupopup-box-items'>                          {/* Zona de redirección */}
                    <NavLink to='/' onClick={this.exit}>Cuenta atrás</NavLink>                             {/* Pantalla principal */}
                    <NavLink to='/horario' onClick={this.exit}>Horario</NavLink>                           {/* CRUD del horario general del evento */}
                    <NavLink to='/salas' onClick={this.exit}>Salas</NavLink>                               {/* CRUD de las salas */}
                    <NavLink to='/empresas' onClick={this.exit}>Empresas</NavLink>                         {/* CRUD de las empresas */}
                    <NavLink to='/empresastimers' onClick={this.exit}>Seguimiento Empresas</NavLink>       {/* Seguimiento de empresas en tiempo */}
                    <NavLink to='/categorias' onClick={this.exit}>Categorías</NavLink>                     {/* CRUD de las categorías */}
                    <NavLink to='/temporizadores' onClick={this.exit}>Temporizadores</NavLink>             {/* CRUD de los temporizadores */}
                    <NavLink to='/login' onClick={this.exit}>Administrador</NavLink>                       {/* Login para obenter permisos CUD del CRUD */}
                </div>
            </div>
        )
    }
}

export default MenuPopUp;