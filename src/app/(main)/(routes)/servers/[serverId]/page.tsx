import prisma from "@/lib/client";
import { currentProfile } from "@/lib/currentProfile";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface ServerPageProps {
    params: {
        serverId: string;
    };
}

async function ServerPage({ params: { serverId } }: ServerPageProps) {
    const profile = await currentProfile();

    if (!profile) {
        return auth().redirectToSignIn();
    }

    const server = await prisma.server.findUnique({
        where: {
            id: serverId,
            members: {
                some: {
                    profileId: profile.id,
                },
            },
        },
        include: {
            channels: {
                where: {
                    name: "general",
                },
            },
        },
    });

    const generalChannel = server?.channels[0];

    if (generalChannel?.name !== "general") {
        return null;
    }

    return redirect(`/servers/${server?.id}/channels/${generalChannel?.id}`);
}

export default ServerPage;
