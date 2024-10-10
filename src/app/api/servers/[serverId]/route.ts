import prisma from "@/lib/client";
import { currentProfile } from "@/lib/currentProfile";
import { NextResponse } from "next/server";

export const PATCH = async (
    req: Request,
    { params }: { params: { serverId: string } }
) => {
    try {
        const { name, imageUrl } = await req.json();

        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!params.serverId) {
            return new NextResponse("Invalid params. Missing server id", {
                status: 404,
            });
        }

        const server = await prisma.server.update({
            where: {
                id: params.serverId,
                profileId: profile.id,
            },
            data: {
                name,
                imageUrl,
            },
        });

        return NextResponse.json(server);
    } catch (err) {
        console.log("[SERVER_ID EDIT SETTINGS PATCH]", err);
        return new NextResponse("Internal Error", { status: 500 });
    }
};

export const DELETE = async (
    req: Request,
    { params }: { params: { serverId: string } }
) => {
    try {
        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!params.serverId) {
            return new NextResponse("Invalid params", {
                status: 404,
            });
        }

        const server = await prisma.server.delete({
            where: {
                id: params.serverId as string,
                profileId: profile.id,
            },
        });

        return NextResponse.json(server);
    } catch (err) {
        console.log("[SERVER DELETE ERROR]", err);
        return new NextResponse("Internal Error", { status: 500 });
    }
};
