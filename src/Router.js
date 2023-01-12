import React, { Component } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import TimerView from './components/TimerView';
import Horario from './components/Horario';
import Salas from './components/Salas';
import Empresas from './components/Empresas';
import Categorias from './components/Categorias';
import Temporizadores from './components/Temporizadores';
import Login from './components/Login';
import Menu from './components/Menu';
import EmpresasEventoTimers from './components/EmpresasEventoTimers';

export default class Router extends Component {
    render() {
        return (
            <BrowserRouter>
                <div className='noselect' style={{"marginTop":"10px"}}>
                    <Menu />
                </div>
                <Routes>
                    <Route path='/' element={<TimerView />}/>
                    <Route path='/horario' element={<Horario />}/>
                    <Route path='/salas' element={<Salas />}/>
                    <Route path='/empresas' element={<Empresas />}/>
                    <Route path='/categorias' element={<Categorias />}/>
                    <Route path='/temporizadores' element={<Temporizadores />}/>
                    <Route path='/login' element={<Login />}/>
                    <Route path='/empresastimers' element={<EmpresasEventoTimers />}/>
                </Routes>
            </BrowserRouter>
        )
    }
}