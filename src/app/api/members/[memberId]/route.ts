import prisma from "@/lib/client";
import { currentProfile } from "@/lib/currentProfile";
import { NextResponse } from "next/server";

export const PATCH = async (
    req: Request,
    { params }: { params: { memberId: string } }
) => {
    try {
        const { role } = await req.json();
        const { memberId } = params;

        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get("serverId");

        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!serverId || !role || !memberId) {
            return new NextResponse("Invalid params", {
                status: 404,
            });
        }

        const server = await prisma.server.update({
            where: {
                id: serverId,
                profileId: profile.id,
            },
            data: {
                members: {
                    update: {
                        where: {
                            id: memberId,
                            profileId: {
                                not: profile.id,
                            },
                        },
                        data: {
                            role,
                        },
                    },
                },
            },
            include: {
                members: {
                    include: {
                        profile: true,
                    },
                    orderBy: {
                        role: "asc",
                    },
                },
            },
        });

        return NextResponse.json(server);
    } catch (err) {
        console.log("[MEMBERS - EDIT SERVER SETTINGS, PATCH]", err);
        return new NextResponse("Internal Error", { status: 500 });
    }
};

export const DELETE = async (
    req: Request,
    { params }: { params: { memberId: string } }
) => {
    try {
        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get("serverId");

        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!params.memberId) {
            return new NextResponse("Invalid params", {
                status: 404,
            });
        }

        const server = await prisma.server.update({
            where: {
                id: serverId as string,
                profileId: profile.id,
            },
            data: {
                members: {
                    deleteMany: {
                        id: params.memberId,
                        profileId: {
                            not: profile.id,
                        },
                    },
                },
            },
            include: {
                members: {
                    include: {
                        profile: true,
                    },
                    orderBy: {
                        role: "asc",
                    },
                },
            },
        });

        return NextResponse.json(server);
    } catch (err) {
        console.log("[MEMBERS - DELETE MEMBER, DELETE]", err);
        return new NextResponse("Internal Error", { status: 500 });
    }
};
