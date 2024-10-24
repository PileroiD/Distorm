"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Plus } from "lucide-react";
import ActionTooltip from "../ActionTooltip";
import { useModal } from "@/hooks/useModalStore";
import { useEffect, useState } from "react";

function NavigationAction() {
    const { onOpen } = useModal();

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 768px)");
        setIsMobile(mediaQuery.matches);

        const handleChange = (e: any) => {
            setIsMobile(e.matches);
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, []);

    const CreateServerButton = (
        <button
            onClick={() => onOpen("createServer")}
            className="group flex items-center"
        >
            <div className="flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center bg-background dark:bg-neutral-700 group-hover:bg-emerald-500">
                <Plus
                    size={25}
                    className="group-hover:text-white transition text-emerald-500"
                />
            </div>
        </button>
    );

    return (
        <div>
            {isMobile ? (
                CreateServerButton
            ) : (
                <ActionTooltip label="Create a new server">
                    {CreateServerButton}
                </ActionTooltip>
            )}
        </div>
    );
}

export default NavigationAction;
