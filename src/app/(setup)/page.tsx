import { ModeToggle } from "@/components/ModeToggle";
import prisma from "@/lib/client";
import { initialProfile } from "@/lib/initialProfile";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";

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

    return (
        <div>
            <UserButton />
            <ModeToggle />
        </div>
    );
}
