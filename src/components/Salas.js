import React, { Component } from 'react';
import './css/Salas.css';

import Swal from 'sweetalert2';
import service from '../services/service';

import plusicon from '../assets/plus.svg';

export class Salas extends Component {
    currentService = new service();
    state = {
        salas : [],
        token : false
    }

    componentDidMount = () => {
        this.loadRooms();
        this.setState({
            token : (localStorage.getItem("token") !== null)
        });
    }

    loadRooms = () => {
        this.currentService.getSalas().then((result) => {
            this.setState({
                salas : result
            });
        });
    }

    generateRoom = () => {
        Swal.fire({
            title: 'Nueva sala',
            input: 'text',
            inputLabel: 'Inserte un nuevo nombre para la sala',
            showCancelButton: true,
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#2C4D9E",
            cancelButtonText: "Cancelar",
            inputValidator: (value) => {
                if (!value) {
                    return 'Debe añadir contenido para crear una nueva sala';
                } else {
                    var auxiliar = this.state.salas;
                    var correcto = true;
                    auxiliar.forEach(element => {
                        if (value.toUpperCase() === element.nombreSala.toUpperCase()) {
                            correcto = false;       
                        }
                    });
                    if (!correcto) { return 'Ya existe una sala con el mismo nombre' };
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.currentService.postSala(result.value).then(() => {
                    Swal.fire({
                        title: 'Sala creada',
                        text: 'Se ha creado la nueva sala en la base de datos',
                        icon: 'success',
                        confirmButtonColor: "#2C4D9E"
                    });
                    this.loadRooms();
                });
            }
        });
    }

    modifyRoom = (index) => {
        if (this.state.token) {
            var currentName = this.state.salas[index].nombreSala;
            Swal.fire({
                title: 'Modificar sala',
                input: 'text',
                inputLabel: 'Nombre',
                inputValue: currentName,
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: "Guardar sala",
                confirmButtonColor: "#2C4D9E",
                denyButtonText: "Eliminar sala",
                denyButtonColor: "#FF0000",
                cancelButtonText: "Cancelar",
                inputValidator: (value) => {
                    if (!value) {
                        return 'El nuevo nombre de la sala no debe estar en blanco';
                    } else {
                        var auxiliar = this.state.salas;
                        var correcto = true;
                        if (currentName.toUpperCase() !== value.toUpperCase()) {
                            auxiliar.forEach(element => {
                                if (value.toUpperCase() === element.nombreSala.toUpperCase()) {
                                    correcto = false;       
                                }
                            });                        
                        }
                        if (!correcto) { return 'Ya existe una sala con el mismo nombre' };
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) { // Modificación de la sala
                    if (currentName.toUpperCase() !== result.value.toUpperCase()) {
                        this.currentService.putSala(this.state.salas[index].idSala, result.value).then(() => {
                            Swal.fire({
                                title: 'Sala modificada',
                                text: 'Se ha modificado la sala en la base de datos',
                                icon: 'success',
                                confirmButtonColor: "#2C4D9E"
                            });
                            this.loadRooms();
                        });
                    }
                }
                if (result.isDenied) { // Eliminación de la sala
                    Swal.fire({
                        title: '¿Estás segur@?',
                        text: "Al eliminar esta sala también se eliminarán los registros de empresas asignadas al misma",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#2C4D9E',
                        cancelButtonColor: '#FF0000',
                        confirmButtonText: 'Sí, estoy segur@',
                        cancelButtonText: 'No, cancelar'
                      }).then((result) => {
                        if (result.isConfirmed) {
                            var currentID = this.state.salas[index].idSala;
                            this.currentService.getTES().then((result_tes) => {
                                if (result_tes.length === 0) {
                                    this.currentService.deleteSala(currentID).then(() => {
                                        Swal.fire({
                                            title: 'Sala eliminada',
                                            text: 'Se ha eliminado la sala de la base de datos',
                                            icon: 'success',
                                            confirmButtonColor: "#2C4D9E"
                                        });
                                        this.loadRooms();
                                    });
                                } else {
                                    var counter = 0;
                                    result_tes.forEach(registro => {
                                        counter ++;
                                        if (registro.idSala === currentID) {
                                            this.currentService.deleteTES(registro.id);
                                        }
                                        if (counter === result_tes.length) {
                                            this.currentService.deleteSala(currentID).then(() => {
                                                Swal.fire({
                                                    title: 'Sala eliminada',
                                                    text: 'Se ha eliminado la sala de la base de datos',
                                                    icon: 'success',
                                                    confirmButtonColor: "#2C4D9E"
                                                });
                                                this.loadRooms();
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });  
        }
    }

    render() {
      return (
            <div>
                <h1 className='timer_title'>SALAS</h1>
                <div className='content_box'>
                    {
                        this.state.salas && (
                            this.state.salas.length === 0 ? (
                                <p className='p_nonexist'>No existen salas en este momento</p>
                            ) : (
                                this.state.salas.map((sala, index) => {
                                    return (
                                        <div className='box_sala scroll' key={index} onClick={() => this.modifyRoom(index)}>
                                            <p className='box_sala_target noselect'>
                                                {sala.nombreSala}
                                            </p>
                                        </div>
                                    )
                                })
                            )
                        )
                    }
                    {
                        this.state.token && (
                            <div className='box_sala last_item' onClick={() => this.generateRoom()}>
                                <p className='box_sala_target noselect'>
                                    <img src={plusicon} alt="Icono más" className='plusicon'/>
                                </p>
                            </div>
                        )
                    }
                </div>
            </div>
      )
    }
}

export default Salas;