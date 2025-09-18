"use client";
//defined the front end socket io client

import { io } from "socket.io-client";

export const socket = io("http://localhost:3001", {autoConnect: false}); //connects to server