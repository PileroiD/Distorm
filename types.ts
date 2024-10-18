import { Member, Profile, Server } from "@prisma/client";
import { Server as NetServer, Socket } from "net";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";

export type ServerWithMembersAndProfiles = Server & {
    members: (Member & { profile: Profile })[];
};

export type NextApiResponseServerIo = NextApiResponse & {
    socket: Socket & {
        server: NetServer & {
            io: SocketIOServer;
        };
    };
};

export type AllowedFileTypes =
    | "image/jpeg"
    | "image/png"
    | "image/gif"
    | "application/pdf";

export enum AllowedFile {
    PNG = "image/png",
    JPEG = "image/jpeg",
    GIF = "image/gif",
    PDF = "application/pdf",
}
