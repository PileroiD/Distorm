import InitialModal from "@/components/modals/InitialModal";
import prisma from "@/lib/client";
import { initialProfile } from "@/lib/initialProfile";
import { redirect } from "next/navigation";

enum ServerNames {
    CODING = "Coding",
    PILEROID = "Pileroid",
}

export default async function SetupPage() {
    const profile = await initialProfile();

    const server = await prisma.server.findFirst({
        where: {
            members: {
                some: {
                    profileId: profile.id,
                },
            },
        },
    });

    if (server) {
        return redirect(`/servers/${server.id}`);
    }

    const servers = await prisma.server.findMany({
        where: {
            OR: [{ name: ServerNames.CODING }, { name: ServerNames.PILEROID }],
        },
        include: {
            _count: {
                select: {
                    members: true,
                },
            },
        },
    });

    return <InitialModal initServers={servers} />;
}
