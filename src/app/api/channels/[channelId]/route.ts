import prisma from "@/lib/client";
import { currentProfile } from "@/lib/currentProfile";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export const DELETE = async (
    req: Request,
    { params }: { params: { channelId: string } }
) => {
    try {
        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get("serverId");

        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!params.channelId || !serverId) {
            return new NextResponse("Invalid params", {
                status: 404,
            });
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
                    delete: {
                        id: params?.channelId,
                        name: {
                            not: "general",
                        },
                    },
                },
            },
        });

        return NextResponse.json(server);
    } catch (err) {
        console.log("[CHANNEL DELETE]", err);
        return new NextResponse("Internal Error", { status: 500 });
    }
};

export const PATCH = async (
    req: Request,
    { params }: { params: { channelId: string } }
) => {
    try {
        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get("serverId");

        const { name, type } = await req.json();

        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!params.channelId || !serverId) {
            return new NextResponse("Invalid params", {
                status: 404,
            });
        }

        if (name === "general") {
            return new NextResponse(`Name cannot be "general"`, {
                status: 400,
            });
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
                    update: {
                        where: {
                            id: params?.channelId,
                            NOT: {
                                name: "general",
                            },
                        },
                        data: {
                            name,
                            type,
                        },
                    },
                },
            },
        });

        return NextResponse.json(server);
    } catch (err) {
        console.log("[CHANNEL UPDATE]", err);
        return new NextResponse("Internal Error", { status: 500 });
    }
};
