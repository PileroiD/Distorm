import prisma from "./client";

interface GetOrCreateConversationProps {
    memberOneId: string;
    memberTwoId: string;
}

export const getOrCreateConversation = async ({
    memberOneId,
    memberTwoId,
}: GetOrCreateConversationProps) => {
    let conversation =
        (await findConversation(memberOneId, memberTwoId)) ||
        (await findConversation(memberTwoId, memberOneId));

    if (!conversation) {
        conversation = await createNewConversation(memberOneId, memberTwoId);
    }

    return conversation;
};

const findConversation = async (memberOneId: string, memberTwoId: string) => {
    try {
        return await prisma.conversation.findFirst({
            where: {
                AND: [{ memberOneId }, { memberTwoId }],
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
    } catch {
        return null;
    }
};

const createNewConversation = async (
    memberOneId: string,
    memberTwoId: string
) => {
    try {
        return await prisma.conversation.create({
            data: {
                memberOneId,
                memberTwoId,
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
    } catch {
        return null;
    }
};
