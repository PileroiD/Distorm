/* eslint-disable @typescript-eslint/no-explicit-any */

import prisma from "@/lib/client";
import { currentProfile } from "@/lib/currentProfile";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

const getCommonData = async (req: Request, directMessageId: string) => {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId)
        return { error: "ConversationId missing", status: 400 };

    const profile = await currentProfile();
    if (!profile) return { error: "Unauthorized", status: 401 };

    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId as string,
            OR: [
                {
                    memberOne: {
                        profileId: profile.id,
                    },
                },
                {
                    memberTwo: {
                        profileId: profile.id,
                    },
                },
            ],
        },
        include: {
            memberOne: {
                include: {
                    profile: true,
                },
            },
            memberTwo: {
                include: {
                    profile: true,
                },
            },
        },
    });

    if (!conversation) return { error: "Conversation not found", status: 404 };

    const member =
        conversation?.memberOne.profileId === profile.id
            ? conversation.memberOne
            : conversation?.memberTwo;
    if (!member) return { error: "Member not found", status: 404 };

    const directMessage = await prisma.directMessage.findFirst({
        where: { id: directMessageId, conversationId: conversation.id },
        include: { member: { include: { profile: true } } },
    });
    if (!directMessage || directMessage.deleted)
        return { error: "Message not found", status: 404 };

    const isMessageOwner = directMessage.memberId === member.id;
    const isAdmin = member.role === MemberRole.ADMIN;
    const isModerator = member.role === MemberRole.MODERATOR;
    const canModify = isMessageOwner || isAdmin || isModerator;

    return {
        profile,
        member,
        directMessage,
        canModify,
        isMessageOwner,
        conversation,
    };
};

export const DELETE = async (
    req: Request,
    { params }: { params: { directMessageId: string } }
) => {
    const { directMessageId } = params;

    const commonData = await getCommonData(req, directMessageId);
    if (commonData.error)
        return new NextResponse(commonData.error, {
            status: commonData.status,
        });

    const { canModify, conversation } = commonData;
    if (!canModify) return new NextResponse("Unauthorized", { status: 401 });

    const deletedMessage = await prisma.directMessage.update({
        where: { id: directMessageId },
        data: {
            fileUrl: null,
            content: "This message has been deleted",
            deleted: true,
        },
        include: { member: { include: { profile: true } } },
    });

    if ((global as any)?.io) {
        const updateKey = `chat:${conversation.id}:messages:update`;
        (global as any).io.emit(updateKey, deletedMessage);
    }

    return NextResponse.json(deletedMessage);
};

export const PATCH = async (
    req: Request,
    { params }: { params: { directMessageId: string } }
) => {
    const { directMessageId } = params;
    const { content } = await req.json();

    const commonData = await getCommonData(req, directMessageId);
    if (commonData.error)
        return new NextResponse(commonData.error, {
            status: commonData.status,
        });

    const { isMessageOwner, conversation } = commonData;
    if (!isMessageOwner)
        return new NextResponse("Unauthorized", { status: 401 });

    const updatedMessage = await prisma.directMessage.update({
        where: { id: directMessageId },
        data: { content },
        include: { member: { include: { profile: true } } },
    });

    if ((global as any)?.io) {
        const updateKey = `chat:${conversation.id}:messages:update`;
        (global as any).io.emit(updateKey, updatedMessage);
    }

    return NextResponse.json(updatedMessage);
};
