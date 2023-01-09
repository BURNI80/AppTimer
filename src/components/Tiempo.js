import React, { useState } from 'react';
import io from 'socket.io-client';
import { useEffect } from 'react';
import Global from '../Global';

const socket = io(Global.SocketUrl, {
    withCredentials: true,
});

function App() {

    const [numero, setNumero] = useState(0);

    useEffect(() => {
        socket.on('envio', (num) => {
            if (num === 12) {
                navigator.vibrate([1000,1000,1000,1000,1000]);
            }
            
            if (num === 3) {
                navigator.vibrate(2500);
            }
            const min = Math.floor(num / 60);
            const sec = num % 60;
            setNumero(`${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`)
        });
    });

    socket.on('envio', (num) => {
    const min = Math.floor(num / 60);
        const sec = num % 60;
        setNumero(`${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`)
    });

    return (
        <div>
            {numero}
        </div>
    );
}

export default App;