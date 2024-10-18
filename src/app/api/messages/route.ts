import prisma from "@/lib/client";
import { currentProfile } from "@/lib/currentProfile";
import { Message } from "@prisma/client";
import { NextResponse } from "next/server";

const MESSAGES_BATCH = 10;

export const GET = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url);
        const cursor = searchParams.get("cursor");
        const channelId = searchParams.get("channelId");

        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!channelId) {
            return new NextResponse("channelId missing", { status: 400 });
        }

        const lastMessage = await prisma.message.findFirst({
            where: {
                channelId,
            },
            orderBy: {
                createdAt: "desc",
            },
            select: { id: true },
        });

        let messages: Message[] = [];

        if (lastMessage?.id) {
            messages = await prisma.message.findMany({
                take: MESSAGES_BATCH,
                // skip: 1,
                where: {
                    channelId,
                },
                cursor: {
                    id: lastMessage?.id,
                },
                include: {
                    member: {
                        include: {
                            profile: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        } else {
            messages = await prisma.message.findMany({
                take: MESSAGES_BATCH,
                where: {
                    channelId,
                },
                include: {
                    member: {
                        include: {
                            profile: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        }

        let nextCursor = null;

        if (messages.length === MESSAGES_BATCH) {
            nextCursor = messages[MESSAGES_BATCH - 1].id;
        }

        return NextResponse.json({
            items: messages,
            nextCursor,
        });
    } catch (error) {
        console.log("[MESSSAGES GET] :>> ", error);
        return new NextResponse("Internal error", { status: 500 });
    }
};
