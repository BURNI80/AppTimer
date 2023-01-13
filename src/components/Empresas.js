import React, { Component } from 'react';
import plusicon from '../assets/plus.svg';

import Swal from 'sweetalert2';
import service from '../services/service';
import './css/Empresas.css';

export class Empresas extends Component {
    currentService = new service();

    state = {
        empresas : [],
        token : false
    }

    componentDidMount = () => {
        this.loadCompanies();
        this.setState({
            token : (localStorage.getItem("token") !== null)
        });
    }

    loadCompanies = () => {
        this.currentService.getEmpresas().then((result) => {
            this.setState({
                empresas : result
            });
        })
    }

    generateCompany = () => {
        Swal.fire({
            title: 'Nueva empresa',
            input: 'text',
            inputLabel: 'Inserte un nuevo nombre para la empresa',
            showCancelButton: true,
            confirmButtonText: "Aceptar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#2C4D9E",
            inputValidator: (value) => {
                if (!value) {
                    return 'Debe añadir contenido para crear una nueva empresa';
                } else {
                    var auxiliar = this.state.empresas;
                    var correcto = true;
                    auxiliar.forEach(element => {
                        if (value.toUpperCase() === element.nombreEmpresa.toUpperCase()) {
                            correcto = false;       
                        }
                    });
                    if (!correcto) { return 'Ya existe una empresa con el mismo nombre' };
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.currentService.postEmpresa(result.value).then(() => {
                    Swal.fire({
                        title: 'Empresa creada',
                        text: 'Se ha creado la nueva empresa en la base de datos',
                        icon: 'success',
                        confirmButtonColor: "#2C4D9E"
                    });
                    this.loadCompanies();
                });
            }
        });
    }

    modifyCompany = (index) => {
        if (this.state.token) {
            var currentName = this.state.empresas[index].nombreEmpresa;
            Swal.fire({
                title: 'Modificar empresa',
                input: 'text',
                inputLabel: 'Nombre',
                inputValue: currentName,
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: "Guardar empresa",
                confirmButtonColor: "#2C4D9E",
                denyButtonText: "Eliminar empresa",
                denyButtonColor: "#FF0000",
                cancelButtonText: "Cancelar",
                inputValidator: (value) => {
                    if (!value) {
                        return 'El nuevo nombre de la empresa no debe estar en blanco';
                    } else {
                        var auxiliar = this.state.empresas;
                        var correcto = true;
                        if (currentName.toUpperCase() !== value.toUpperCase()) {
                            auxiliar.forEach(element => {
                                if (value.toUpperCase() === element.nombreEmpresa.toUpperCase()) {
                                    correcto = false;       
                                }
                            });                        
                        }
                        if (!correcto) { return 'Ya existe una empresa con el mismo nombre' };
                    }
                }
            }).then((result) => {
                if (result.isConfirmed) { // Modificar empresa
                    if (currentName.toUpperCase() !== result.value.toUpperCase()) {
                        this.currentService.putEmpresa(this.state.empresas[index].idEmpresa, result.value).then(() => {
                            Swal.fire({
                                title: 'Empresa modificada',
                                text: 'Se ha modificado la empresa en la base de datos',
                                icon: 'success',
                                confirmButtonColor: "#2C4D9E"
                            });
                            this.loadCompanies();
                        });
                    }
                }
                if (result.isDenied) { // Eliminar empresa
                    Swal.fire({
                        title: '¿Estás segur@?',
                        text: "La empresa y sus correspondientes registros de asignaciones, se eliminarán para siempre",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#2C4D9E',
                        cancelButtonColor: '#FF0000',
                        confirmButtonText: 'Sí, estoy segur@',
                        cancelButtonText: 'No, cancelar'
                      }).then((result) => {
                        if (result.isConfirmed) {
                            var currentID = this.state.empresas[index].idEmpresa;
                            this.currentService.getTES().then((result_tes) => {
                                if (result_tes.length === 0) {
                                    this.executeDelete(index);
                                } else {
                                    var counter = 0;
                                    result_tes.forEach(registro => {
                                        counter ++;
                                        if (registro.idEmpresa === currentID) {
                                            this.currentService.deleteTES(registro.id);
                                        }
                                        if (counter === result_tes.length) {
                                            this.executeDelete(index);
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

    executeDelete = (index) => {
        this.currentService.deleteEmpresa(this.state.empresas[index].idEmpresa).then(() => {
            Swal.fire({
                title: 'Empresa eliminada',
                text: 'Se ha eliminado la empresa de la base de datos',
                icon: 'success',
                confirmButtonColor: "#2C4D9E"
            });
            this.loadCompanies();
        });
    }

    render() {
        return (
            <div>
                <h1 className='timer_title noselect'>EMPRESAS</h1>
                <div className='content_box'>
                    {
                        this.state.empresas && (
                            this.state.empresas.length === 0 ? (
                                <p className='p_nonexist'>No existen empresas en este momento</p>
                            ) : (
                                this.state.empresas.map((empresa, index) => {
                                    return (
                                        <div className='box_empresa scroll' key={index} onClick={() => this.modifyCompany(index)}>
                                            <p className='box_empresa_target noselect'>
                                                {empresa.nombreEmpresa}
                                            </p>
                                        </div>
                                    )
                                })
                            )
                        )
                    }
                    {
                        this.state.token && (
                            <div className='box_empresa last_item' onClick={() => this.generateCompany()}>
                                <p className='box_empresa_target noselect'>
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

export default Empresas;