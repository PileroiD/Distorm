/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/client";
import { currentProfile } from "@/lib/currentProfile";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    try {
        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { content, fileUrl = "" } = await req.json();
        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get("serverId");
        const channelId = searchParams.get("channelId");

        if (!serverId || !channelId || !content) {
            return new NextResponse("Invalid params", { status: 400 });
        }

        const server = await prisma.server.findFirst({
            where: {
                id: serverId as string,
                members: {
                    some: {
                        profileId: profile.id,
                    },
                },
            },
            include: {
                members: true,
            },
        });

        if (!server) {
            return new NextResponse("Server not found", { status: 404 });
        }

        const channel = await prisma.channel.findFirst({
            where: {
                id: channelId as string,
                serverId: serverId as string,
            },
        });

        if (!channel) {
            return new NextResponse("Channel not found", { status: 404 });
        }

        const member = server?.members.find(
            (member) => member.profileId === profile.id
        );

        if (!member) {
            return new NextResponse("Member not found", { status: 404 });
        }

        const message = await prisma.message.create({
            data: {
                content,
                fileUrl,
                channelId: channelId as string,
                memberId: member.id,
            },
            include: {
                member: {
                    include: {
                        profile: true,
                    },
                },
            },
        });

        const channelKey = `chat:${channelId}:messages`;
        if ((global as any)?.io) {
            (global as any).io.emit(channelKey, message);
        }

        return NextResponse.json(message);
    } catch (error) {
        console.log("MESSAGES POST :>> ", error);
        return new NextResponse("Internal error", { status: 500 });
    }
};
