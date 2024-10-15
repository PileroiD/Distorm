import ChatHeader from "@/components/chat/ChatHeader";
import prisma from "@/lib/client";
import { getOrCreateConversation } from "@/lib/conversation";
import { currentProfile } from "@/lib/currentProfile";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface ConversationPageProps {
    params: {
        serverId: string;
        memberId: string;
    };
}

async function ConversationPage({ params }: ConversationPageProps) {
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
        </div>
    );
}

export default ConversationPage;
