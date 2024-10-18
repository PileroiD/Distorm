/* eslint-disable @typescript-eslint/no-explicit-any */

import prisma from "@/lib/client";
import { currentProfile } from "@/lib/currentProfile";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

const getCommonData = async (req: Request, messageId: string) => {
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get("channelId");
    const serverId = searchParams.get("serverId");

    if (!serverId) return { error: "ServerId missing", status: 400 };
    if (!channelId) return { error: "ChannelId missing", status: 400 };

    const profile = await currentProfile();
    if (!profile) return { error: "Unauthorized", status: 401 };

    const server = await prisma.server.findFirst({
        where: {
            id: serverId,
            members: { some: { profileId: profile.id } },
        },
        include: { members: true },
    });
    if (!server) return { error: "Server not found", status: 404 };

    const channel = await prisma.channel.findFirst({
        where: { id: channelId, serverId },
    });
    if (!channel) return { error: "Channel not found", status: 404 };

    const member = server.members.find(
        (member) => member.profileId === profile.id
    );
    if (!member) return { error: "Member not found", status: 404 };

    const message = await prisma.message.findFirst({
        where: { id: messageId, channelId },
        include: { member: { include: { profile: true } } },
    });
    if (!message || message.deleted)
        return { error: "Message not found", status: 404 };

    const isMessageOwner = message.memberId === member.id;
    const isAdmin = member.role === MemberRole.ADMIN;
    const isModerator = member.role === MemberRole.MODERATOR;
    const canModify = isMessageOwner || isAdmin || isModerator;

    return {
        profile,
        server,
        channel,
        member,
        message,
        canModify,
        isMessageOwner,
    };
};

export const DELETE = async (
    req: Request,
    { params }: { params: { messageId: string } }
) => {
    const { messageId } = params;

    const commonData = await getCommonData(req, messageId);
    if (commonData.error)
        return new NextResponse(commonData.error, {
            status: commonData.status,
        });

    const { canModify } = commonData;
    if (!canModify) return new NextResponse("Unauthorized", { status: 401 });

    const deletedMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
            fileUrl: null,
            content: "This message has been deleted",
            deleted: true,
        },
    });

    return NextResponse.json(deletedMessage);
};

export const PATCH = async (
    req: Request,
    { params }: { params: { messageId: string } }
) => {
    const { messageId } = params;
    const { content } = await req.json();

    const commonData = await getCommonData(req, messageId);
    if (commonData.error)
        return new NextResponse(commonData.error, {
            status: commonData.status,
        });

    const { message, isMessageOwner } = commonData;
    if (!isMessageOwner)
        return new NextResponse("Unauthorized", { status: 401 });

    const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: { content },
        include: { member: { include: { profile: true } } },
    });

    if ((global as any)?.io) {
        const updateKey = `chat:${message.channelId}:messages:update`;
        (global as any).io.emit(updateKey, updatedMessage);
    }

    return NextResponse.json(updatedMessage);
};
