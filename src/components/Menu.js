import React, { Component } from 'react';
import './css/Menu.css';

/* 
    En la medida de lo posible, trabajaremos con SVG para no cargar la App 
    con peso innecesario de imagenes para formas o iconos.
*/
import menuicon from '../assets/menuicon.svg';

/* SUBCOMPONENTES */
import MenuPopUp from './MenuPopUp';
import Tiempo from './Tiempo';
export class Menu extends Component {

    showHiddenMenu = () => {
        document.getElementById("sidemenu").classList.toggle("menupopup-box-component-show");
        document.getElementById("divbg_black").classList.toggle("background_black_show");
    }

    render() {
        return (
            <div style={{"width":"100%"}}>
                <div className='background_black' id='divbg_black' onClick={this.showHiddenMenu}></div> {/* Div para oscurecer y bloquear el fondo */}
                <MenuPopUp showHiddenMenu={this.showHiddenMenu}/> {/* Menu lateral emergente */}
                <div className='menubar'> {/* NavBar general */}
                    <button className='menucircle' onClick={this.showHiddenMenu}>
                        <img src={menuicon} alt="Icono de tres líneas para el menú"/>
                    </button>
                    <b className='menutag'>Tiempo restante: <Tiempo/></b>
                </div>
            </div>
        )
    }
}

export default Menu;