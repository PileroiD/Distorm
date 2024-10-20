import prisma from "@/lib/client";
import { currentProfile } from "@/lib/currentProfile";
import { DirectMessage } from "@prisma/client";
import { NextResponse } from "next/server";

const MESSAGES_BATCH = 10;

export const GET = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url);
        const cursor = searchParams.get("cursor");
        const conversationId = searchParams.get("conversationId");

        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!conversationId) {
            return new NextResponse("conversationId missing", { status: 400 });
        }

        let messages: DirectMessage[] = [];

        if (cursor !== "1") {
            messages = await prisma.directMessage.findMany({
                take: MESSAGES_BATCH,
                skip: 1,
                where: {
                    conversationId,
                },
                cursor: {
                    id: cursor as string,
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
            messages = await prisma.directMessage.findMany({
                take: MESSAGES_BATCH,
                where: {
                    conversationId,
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
        console.log("[DIRECT_MESSAGES GET] :>> ", error);
        return new NextResponse("Internal error", { status: 500 });
    }
};
