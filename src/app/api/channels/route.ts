import { currentProfile } from "@/lib/currentProfile";
import prisma from "@/lib/client";
import { NextResponse } from "next/server";
import { ChannelType, MemberRole } from "@prisma/client";

export const POST = async (req: Request) => {
    try {
        const { name, type } = await req.json();
        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get("serverId");

        const profile = await currentProfile();

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!name || !type) {
            return new NextResponse("Invalid name or type", { status: 400 });
        }

        if (name === "general") {
            return new NextResponse(`Name caanot be "general"`, {
                status: 400,
            });
        }

        if (!Object.values(ChannelType).includes(type)) {
            return new NextResponse("Invalid type", { status: 400 });
        }

        const server = await prisma.server.update({
            where: {
                id: serverId as string,
                members: {
                    some: {
                        profileId: profile.id,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR],
                        },
                    },
                },
            },
            data: {
                channels: {
                    create: {
                        name,
                        type,
                        profileId: profile.id,
                    },
                },
            },
        });

        return NextResponse.json(server);
    } catch (error) {
        console.log("[SERVERS_POST] :>> ", error);
        return new NextResponse("Internal error", { status: 500 });
    }
};
