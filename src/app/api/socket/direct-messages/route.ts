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

        const { content, fileUrl = "", fileType = "" } = await req.json();
        const { searchParams } = new URL(req.url);
        const conversationId = searchParams.get("conversationId");

        if (!conversationId || !content) {
            return new NextResponse("Invalid params", { status: 400 });
        }

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

        if (!conversationId) {
            return new NextResponse("Conversation not found", { status: 404 });
        }

        const member =
            conversation?.memberOne.profileId === profile.id
                ? conversation.memberOne
                : conversation?.memberTwo;

        if (!member) {
            return new NextResponse("Member not found", { status: 404 });
        }

        const message = await prisma.directMessage.create({
            data: {
                content,
                fileUrl,
                fileType,
                conversationId: conversationId as string,
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

        if ((global as any)?.io) {
            const addKey = `chat:${conversationId}:messages`;
            (global as any).io.emit(addKey, message);
        }

        return NextResponse.json(message);
    } catch (error) {
        console.log("MESSAGES POST :>> ", error);
        return new NextResponse("Internal error", { status: 500 });
    }
};
