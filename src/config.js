import { io } from "socket.io-client" 
let socket = io("http://localhost:8800");

export const socketCient = ()=>{
    return socket;
}

export const url = ()=>{
    return "http://localhost:8800/api"
}