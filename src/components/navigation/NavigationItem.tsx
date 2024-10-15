"use client";

import ActionTooltip from "../ActionTooltip";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Channel, Server } from "@prisma/client";

interface NavigationItemProps {
    server: Server;
    generalChannel: Channel;
}

function NavigationItem({ server, generalChannel }: NavigationItemProps) {
    const params = useParams();
    const router = useRouter();

    const { id, name, imageUrl } = server;

    const onClick = () =>
        generalChannel.name === "general"
            ? router.push(`/servers/${id}/channels/${generalChannel.id}`)
            : router.push(`/servers/${id}/`);

    return (
        <ActionTooltip label={name}>
            <button
                onClick={onClick}
                className="group relative flex items-center mb-3"
            >
                <div
                    className={cn(
                        "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
                        params?.serverId !== id && "group-hover::h-[20px]",
                        params?.serverId === id ? "h-[36px]" : "h-[8px]"
                    )}
                />
                <div
                    className={cn(
                        "relative group flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
                        params?.serverId === id &&
                            "bg-primary/70 text-primary rounded-[16px]"
                    )}
                >
                    <Image
                        src={imageUrl}
                        alt="channel"
                        fill
                        className="object-cover"
                    />
                </div>
            </button>
        </ActionTooltip>
    );
}

export default NavigationItem;
