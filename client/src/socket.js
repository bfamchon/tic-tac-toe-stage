import socketIOClient from 'socket.io-client'
const ENDPOINT = 'ws://localhost:4000';

let socket = null;

export const initializeSocketConection = () => {
    return getSocket();
}
export const getSocket = () => {
    if (socket) {
        return socket;
    }
    socket = socketIOClient(ENDPOINT);
    return socket;
}
export const disconnectSocket = () => {
    socket.disconnect();
    socket = null;
}

export const emitNewGameEvent = () => {
    socket.emit('newGame');
}

export const emitJoiningEvent = (room) => {
    socket.emit('joining', { room })
}