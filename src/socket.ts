"use client";

import { DefaultEventsMap } from "socket.io";
import { io, Socket } from "socket.io-client";

export const socket: Socket<DefaultEventsMap, DefaultEventsMap> = io();
