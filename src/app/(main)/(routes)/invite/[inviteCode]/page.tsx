import prisma from "@/lib/client";
import { currentProfile } from "@/lib/currentProfile";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function InviteCodePage({
    params,
}: {
    params: {
        inviteCode: string;
    };
}) {
    const profile = await currentProfile();

    if (!profile) {
        return auth().redirectToSignIn();
    }

    if (!params.inviteCode) {
        return redirect("/");
    }

    const existingServer = await prisma.server.findFirst({
        where: {
            inviteCode: params.inviteCode,
            members: {
                some: {
                    profileId: profile.id,
                },
            },
        },
    });

    if (existingServer) {
        return redirect(`/servers/${existingServer.id}`);
    }

    const server = await prisma.server.update({
        where: {
            inviteCode: params.inviteCode,
        },
        data: {
            members: {
                create: {
                    profileId: profile.id,
                },
            },
        },
    });

    if (server) {
        return redirect(`/servers/${server.id}`);
    }

    return <></>;
}

export default InviteCodePage;
