import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";

export const currentProfile = async () => {
    const { userId } = auth();

    if (!userId) {
        return null;
    }

    const profile = await prisma.profile.findUnique({
        where: {
            userId,
        },
    });

    return profile;
};
