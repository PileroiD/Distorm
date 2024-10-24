import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import ChatMessages from "@/components/chat/ChatMessages";
import MediaRoom from "@/components/MediaRoom";
import prisma from "@/lib/client";
import { getOrCreateConversation } from "@/lib/conversation";
import { currentProfile } from "@/lib/currentProfile";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

interface ConversationPageProps {
    params: {
        serverId: string;
        memberId: string;
    };
    searchParams: {
        video?: boolean;
    };
}

export async function generateMetadata({
    params,
}: ConversationPageProps): Promise<Metadata> {
    const member = await prisma.member.findUnique({
        where: {
            id: params?.memberId,
        },
        include: {
            profile: {
                select: {
                    name: true,
                },
            },
        },
    });

    const server = await prisma.server.findUnique({
        where: {
            id: params?.serverId,
        },
    });

    return {
        title: `Distorm - ${server?.name}: ${member?.profile.name}`,
        description: `${server?.name}: ${member?.profile.name}`,
    };
}

async function ConversationPage({
    params,
    searchParams,
}: ConversationPageProps) {
    const { serverId, memberId: memberTwoId } = params;

    const profile = await currentProfile();
    if (!profile) {
        return auth().redirectToSignIn();
    }

    const currentMember = await prisma.member.findFirst({
        where: {
            serverId: serverId,
            profileId: profile.id,
        },
        include: {
            profile: true,
        },
    });

    if (!currentMember) {
        return redirect("/");
    }

    const conversation = await getOrCreateConversation({
        memberOneId: currentMember.id,
        memberTwoId,
    });

    if (!conversation) {
        return redirect(`/servers/${serverId}`);
    }

    const { memberOne, memberTwo } = conversation;

    const otherMember =
        memberOne.profileId === profile.id ? memberTwo : memberOne;

    return (
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
            <ChatHeader
                imageUrl={otherMember.profile.imageUrl}
                name={otherMember.profile.name}
                serverId={serverId}
                type="conversation"
            />
            {searchParams.video && (
                <MediaRoom chatId={conversation.id} video={true} audio={true} />
            )}
            {!searchParams.video && (
                <>
                    <ChatMessages
                        member={currentMember}
                        name={otherMember.profile.name}
                        chatId={conversation.id}
                        type="conversation"
                        apiUrl="/api/direct-messages"
                        paramKey="conversationId"
                        paramValue={conversation.id}
                        socketUrl="/api/socket/direct-messages"
                        socketQuery={{
                            conversationId: conversation.id,
                        }}
                    />
                    <ChatInput
                        name={otherMember.profile.name}
                        type="conversation"
                        apiUrl="/api/socket/direct-messages"
                        query={{
                            conversationId: conversation.id,
                        }}
                    />
                </>
            )}
        </div>
    );
}

export default ConversationPage;
