import axios from 'axios';
import Global from '../Global';
import Swal from 'sweetalert2';
import io from "socket.io-client";

const socket = io(Global.SocketUrl, {
    withCredentials: true,
});

export default class service {

    generateToken(user, password) {
        var usuario = {
            userName : user,
            password : password
        }
        var url = Global.mainUrl + "Auth/Login";
        return new Promise(function(resolve) {
            axios.post(url, usuario).then(response => {
                resolve(response.data);
            }).catch((error) => {
                // Error
                if (error.response.status === 401) {
                    Swal.fire(
                        'Acceso denegado',
                        'Credenciales incorrectas',
                        'error'
                    );
                    // The request was made and the server responded with a status code that falls out of the range of 2xx
                    // console.log(error.response.data);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error:', error.message);
                }
            });
        });
    }

    getSalas() {
        var url = Global.mainUrl + "api/salas";
        return new Promise(function(resolve) {
            axios.get(url).then(response => {
                resolve(response.data);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    getSala(idsala) {
        var url = Global.mainUrl + "api/salas/" + idsala;
        return new Promise(function(resolve) {
            axios.get(url).then(response => {
                resolve(response.data);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    postSala(nombreSala) {
        var url = Global.mainUrl + "api/salas/createsala/" + nombreSala;
        return new Promise(function(resolve) {
            axios.post(url).then(response => {
                resolve(response);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    putSala(idSala, nombreSala) {
        var url = Global.mainUrl + "api/salas/updatesala/" + idSala + "/" + nombreSala;
        return new Promise(function(resolve) {
            axios.put(url).then(response => {
                resolve(response);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    deleteSala(idSala) {
        var url = Global.mainUrl + "api/salas/" + idSala;
        return new Promise(function(resolve) {
            axios.delete(url).then(response => {
                resolve(response);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    getTES() { // get Tiempos Empresas Salas
        var url = Global.mainUrl + "api/TiempoEmpresaSala";
        return new Promise(function(resolve) {
            axios.get(url).then(response => {
                resolve(response.data);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    postTES(newRegister) {
        var url = Global.mainUrl + "api/TiempoEmpresaSala";
        return new Promise(function(resolve) {
            axios.post(url, newRegister).then(response => {
                resolve(response);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    deleteTES(idTES) {
        var url = Global.mainUrl + "api/TiempoEmpresaSala/" + idTES;
        return new Promise(function(resolve) {
            axios.delete(url).then(response => {
                resolve(response);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    getEmpresas() {
        var url = Global.mainUrl + "api/empresas";
        return new Promise(function(resolve) {
            axios.get(url).then(response => {
                resolve(response.data);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    getEmpresa(idempresa) {
        var url = Global.mainUrl + "api/empresas/" + idempresa;
        return new Promise(function(resolve) {
            axios.get(url).then(response => {
                resolve(response.data);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    postEmpresa(nombreEmpresa) {
        var url = Global.mainUrl + "api/empresas/createempresa/" + nombreEmpresa;
        return new Promise(function(resolve) {
            axios.post(url).then(response => {
                resolve(response);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    putEmpresa(idEmpresa, nombreEmpresa) {
        var url = Global.mainUrl + "api/empresas/updateempresa/" + idEmpresa + "/" + nombreEmpresa;
        return new Promise(function(resolve) {
            axios.put(url).then(response => {
                resolve(response);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    deleteEmpresa(idEmpresa) {
        var url = Global.mainUrl + "api/empresas/" + idEmpresa;
        return new Promise(function(resolve) {
            axios.delete(url).then(response => {
                resolve(response);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    getTemporizadores() {
        var url = Global.mainUrl + "api/timers";
        return new Promise(function(resolve) {
            axios.get(url).then(response => {
                resolve(response.data);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    postTemporizador(newTimer) {
        var url = Global.mainUrl + "api/timers";
        return new Promise(function(resolve) {
            axios.post(url, newTimer).then(response => {
                socket.emit("syncData");
                resolve(response);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    putTemporizador(newTimer) {
        var url = Global.mainUrl + "api/timers";
        return new Promise(function(resolve) {
            axios.put(url, newTimer).then(response => {
                socket.emit("syncData");
                resolve(response);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    deleteTemporizador(idTimer) {
        var url = Global.mainUrl + "api/timers/" + idTimer;
        return new Promise(function(resolve) {
            axios.delete(url).then(response => {
                socket.emit("syncData");
                resolve(response);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    getCategorias() {
        var url = Global.mainUrl + "api/categoriastimer";
        return new Promise(function(resolve) {
            axios.get(url).then(response => {
                resolve(response.data);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    getCategoria(idcategoria) {
        var url = Global.mainUrl + "api/categoriastimer/" + idcategoria;
        return new Promise(function(resolve) {
            axios.get(url).then(response => {
                resolve(response.data);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    postCategoria = (newCategory) => {
        var url = Global.mainUrl + "api/categoriastimer";
        return new Promise(function(resolve) {
            axios.post(url, newCategory).then(response => {
                socket.emit("syncData");
                resolve(response);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    putCategoria = (newCategory) => {
        var url = Global.mainUrl + "api/categoriastimer";
        return new Promise(function(resolve) {
            axios.put(url, newCategory).then(response => {
                socket.emit("syncData");
                resolve(response);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    deleteCategoria(idcategoria) {
        var url = Global.mainUrl + "api/categoriastimer/" + idcategoria;
        return new Promise(function(resolve) {
            axios.delete(url).then(response => {
                socket.emit("syncData");
                resolve(response);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    deleteAllTimers() {
        var url = Global.mainUrl + "api/Timers/DeleteAllTimers";
        return new Promise(function(resolve) {
            axios.delete(url).then(response => {
                socket.emit("syncData");
                resolve(response);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }


    // INSERCCIÓN DE PACO PARA ELABORAR LA VISTA DE SEGUIMIENTO DE EMPRESAS
    // (CODIGO NUEVO DE TIMERS PARA UPDATE)
    updateIncreaseTimers(minutes) { // INCREMENTAMOS EN n MINUTES
        var url = Global.mainUrl + "api/timers/increasetimers/" + minutes;
        return new Promise(function(resolve) {
            axios.put(url).then(response => {
                socket.emit("syncData");
                resolve(response);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    getEmpresasTimers() {
        var url = Global.mainUrl + "api/timereventos/empresastimers";
        return new Promise(function(resolve) {
            axios.get(url).then(response => {
                resolve(response.data);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    getTimersEventos() {
        var url = Global.mainUrl + "api/timereventos";
        return new Promise(function(resolve) {
            axios.get(url).then(response => {
                resolve(response.data);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }

    findTimersActualesEmpresa(idempresa) {
        var url = Global.mainUrl + "api/timereventos/eventosactualesempresa/" + idempresa;
        return new Promise(function(resolve) {
            axios.get(url).then(response => {
                resolve(response.data);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    } 

    findTimersEventosEmpresa(idempresa) {
        var url = Global.mainUrl + "api/timereventos/eventosempresa/" + idempresa;
        return new Promise(function(resolve) {
            axios.get(url).then(response => {
                resolve(response.data);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    } 

    findTimersEventosSala(idsala) {
        var url = Global.mainUrl + "api/timereventos/eventossala/" + idsala;
        return new Promise(function(resolve) {
            axios.get(url).then(response => {
                resolve(response.data);
            }).catch((error) => {
                // Something happened in setting up the request that triggered an Error
                console.log('Error:', error.message);
            });
        });
    }   

}