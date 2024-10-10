import prisma from "@/lib/client";
import { currentProfile } from "@/lib/currentProfile";
import { redirect } from "next/navigation";
import SidebarHeader from "./SidebarHeader";
import { ScrollArea } from "../ui/scroll-area";
import ServerSearch from "./ServerSearch";
import { Channel, ChannelType, MemberRole } from "@prisma/client";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";

const iconMap = {
    [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
    [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
    [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />,
};

const roleIconMap = {
    [MemberRole.GUEST]: null,
    [MemberRole.MODERATOR]: (
        <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />
    ),
    [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 mr-2 text-rose-500" />,
};

async function ServerSidebar({ serverId }: { serverId: string }) {
    const profile = await currentProfile();

    if (!profile) {
        return redirect("/");
    }

    const server = await prisma.server.findUnique({
        where: {
            id: serverId,
        },
        include: {
            channels: {
                orderBy: {
                    createdAt: "asc",
                },
            },
            members: {
                include: {
                    profile: true,
                },
                orderBy: {
                    role: "asc",
                },
            },
        },
    });

    if (!server) {
        return redirect("/");
    }

    const textChannels = server?.channels.filter(
        (channel) => channel.type === "TEXT"
    );
    const audioChannels = server?.channels.filter(
        (channel) => channel.type === "AUDIO"
    );
    const videoChannels = server?.channels.filter(
        (channel) => channel.type === "VIDEO"
    );

    const members = server?.members.filter(
        (member) => member.profileId !== profile.id
    );
    const currentUserRole = server?.members.find(
        (member) => member.profileId === profile.id
    )?.role;

    const getChannelInnerData = (channel: Channel) => ({
        id: channel.id,
        name: channel.name,
        icon: iconMap[channel.type],
    });

    return (
        <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
            <SidebarHeader server={server} currentUserRole={currentUserRole} />
            <ScrollArea>
                <div className="flex-1 px-3">
                    <div className="mt-2">
                        <ServerSearch
                            data={[
                                {
                                    label: "Text channels",
                                    type: "channel",
                                    data: textChannels?.map(
                                        getChannelInnerData
                                    ),
                                },
                                {
                                    label: "Audio channels",
                                    type: "channel",
                                    data: audioChannels?.map(
                                        getChannelInnerData
                                    ),
                                },
                                {
                                    label: "Video channels",
                                    type: "channel",
                                    data: videoChannels?.map(
                                        getChannelInnerData
                                    ),
                                },

                                {
                                    label: "Members",
                                    type: "member",
                                    data: members?.map((member) => ({
                                        id: member.id,
                                        name: member.profile.name,
                                        icon: roleIconMap[member.role],
                                    })),
                                },
                            ]}
                        />
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}

export default ServerSidebar;
