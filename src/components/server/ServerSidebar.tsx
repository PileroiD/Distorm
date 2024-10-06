import prisma from "@/lib/client";
import { currentProfile } from "@/lib/currentProfile";
import { redirect } from "next/navigation";
import SidebarHeader from "./SidebarHeader";

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

    return (
        <div className="flex flex-col h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
            <SidebarHeader server={server} currentUserRole={currentUserRole} />
        </div>
    );
}

export default ServerSidebar;
