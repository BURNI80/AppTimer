import React, { Component } from 'react';
import './css/SalaPopUp.css';
import service from '../services/service';

export class SalaPopUp extends Component {
    currentService = new service();

    nindex = 0;
    state = {
        salas : []
    }

    componentDidMount = () => {
        this.loadRooms();
    }

    exit = () => { this.props.changeStatusSalaPopUp(); }
    changeRoom = (name, id) => { 
        this.props.changeRoom(name, id);
        this.exit();
    }

    loadRooms = () => {
        this.currentService.getSalas().then((result) => {
            this.setState({
                salas : result
            });
        });
    }

    render() {
        return (
            <div className='box-component'>
                <div className='box-popup'>
                    <span className='close-icon' onClick={ () => this.exit() }></span>
                    <span className='box-btns'>
                        {
                            this.state.salas.map((sala, index) => {
                                return (
                                    <button className='popup-btn-sala popup-btn-sala-shadow' 
                                            key={index}
                                            onClick={ () => this.changeRoom(sala.nombreSala, sala.idSala)}>
                                        {sala.nombreSala}
                                    </button>
                                );
                            })
                        }
                    </span>
                </div>
            </div>
        )
    }
}

export default SalaPopUp;