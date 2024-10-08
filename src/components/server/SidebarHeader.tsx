"use client";

import { MemberRole } from "@prisma/client";
import { ServerWithMembersAndProfiles } from "../../../types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
    ChevronDown,
    LogOut,
    PlusCircle,
    Settings,
    Trash,
    UserPlus,
    Users,
} from "lucide-react";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { useModal } from "@/hooks/useModalStore";

interface SidebarHeaderProps {
    server: ServerWithMembersAndProfiles;
    currentUserRole?: MemberRole | undefined;
}

function SidebarHeader({ server, currentUserRole }: SidebarHeaderProps) {
    const { onOpen } = useModal();

    const isAdmin = currentUserRole === MemberRole.ADMIN;
    const isModerator = isAdmin || currentUserRole === MemberRole.MODERATOR;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none" asChild>
                <button className="w-full text-md font-semibold px-3 flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition">
                    {server.name}
                    <ChevronDown className="h-5 w-5 ml-auto" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 text-xs font-medium text-black dark:text-neutral-400 space-y-[2px]">
                {isModerator && (
                    <DropdownMenuItem
                        onClick={() => onOpen("invite", { server })}
                        className="hover:text-indigo-400 transition hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 hover:outline-none flex items-center text-indigo-600 dark:text-indigo-400 px-3 py-2 text-sm cursor-pointer"
                    >
                        Invite people
                        <UserPlus className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {isAdmin && (
                    <DropdownMenuItem
                        onClick={() => onOpen("editSettings", { server })}
                        className="hover:text-white transition hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 hover:outline-none flex items-center px-3 py-2 text-sm cursor-pointer"
                    >
                        Server settings
                        <Settings className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {isAdmin && (
                    <DropdownMenuItem className="hover:text-white transition hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 hover:outline-none flex items-center px-3 py-2 text-sm cursor-pointer">
                        Manage Members
                        <Users className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {isModerator && (
                    <DropdownMenuItem className="hover:text-white transition hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 hover:outline-none flex items-center px-3 py-2 text-sm cursor-pointer">
                        Create channel
                        <PlusCircle className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {isModerator && <DropdownMenuSeparator />}
                {isAdmin && (
                    <DropdownMenuItem className="hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 hover:outline-none flex items-center px-3 py-2 text-sm cursor-pointer text-rose-500">
                        Delete server
                        <Trash className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
                {!isAdmin && (
                    <DropdownMenuItem className="hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 hover:outline-none flex items-center px-3 py-2 text-sm cursor-pointer text-rose-500">
                        Leave server
                        <LogOut className="h-4 w-4 ml-auto" />
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default SidebarHeader;
