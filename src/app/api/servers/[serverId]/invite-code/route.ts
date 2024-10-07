import prisma from "@/lib/client";
import { currentProfile } from "@/lib/currentProfile";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const PATCH = async (
    req: Request,
    { params }: { params: { serverId: string } }
) => {
    try {
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
                inviteCode: uuidv4(),
            },
        });

        return NextResponse.json(server);
    } catch (err) {
        console.log("[SERVER_ID PATCH]", err);
        return new NextResponse("Internal Error", { status: 500 });
    }
};
