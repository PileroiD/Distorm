import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import prisma from "@/lib/client";
import { currentProfile } from "@/lib/currentProfile";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface ChannelPageProps {
    params: {
        serverId: string;
        channelId: string;
    };
}

async function ChannelPage({ params }: ChannelPageProps) {
    const profile = await currentProfile();

    if (!profile) {
        return auth().redirectToSignIn();
    }

    const channel = await prisma.channel.findUnique({
        where: {
            id: params?.channelId,
        },
    });

    const member = await prisma.member.findFirst({
        where: {
            serverId: params?.serverId,
            profileId: profile?.id,
        },
    });

    if (!channel || !member) {
        return redirect("/");
    }

    return (
        <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
            <ChatHeader
                name={channel.name}
                serverId={channel.serverId}
                type="channel"
            />
            <div className="flex-1">Future Messages</div>
            <ChatInput
                name={channel.name}
                type="channel"
                apiUrl="/api/socket/messages"
                query={{ channelId: channel.id, serverId: channel.serverId }}
            />
        </div>
    );
}

export default ChannelPage;
