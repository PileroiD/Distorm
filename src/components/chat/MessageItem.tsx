"use client";

import { Member, MemberRole, Message, Profile } from "@prisma/client";
import { MessageWithMemberAndProfile } from "./ChatMessages";
import { format } from "date-fns";
import UserAvatar from "../UserAvatar";
import ActionTooltip from "../ActionTooltip";
import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash } from "lucide-react";
import { AllowedFile } from "../../../types";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import * as z from "zod";
import qs from "query-string";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import axios from "axios";

const DATE_FORMAT = "d MMM yyyy, HH:mm";

interface MessageItemProps {
    message: MessageWithMemberAndProfile;
    currentMember: Member;
    socketUrl: string;
    socketQuery: Record<string, string>;
}

const roleIconMap = {
    GUEST: null,
    MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
    ADMIN: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
};

const formSchema = z.object({
    content: z.string().min(1),
});

function MessageItem({
    message,
    currentMember,
    socketQuery,
    socketUrl,
}: MessageItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: message.content,
        },
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: `${socketUrl}/${message.id}`,
                query: socketQuery,
            });

            await axios.patch(url, values);
            form.reset();
            setIsEditing(false);
        } catch (err) {
            console.log("err :>> ", err);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleKeyDown = (event: any) => {
            if (event.key === "Escape" || event.keyCode === 27) {
                setIsEditing(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        form.reset({
            content: message.content,
        });
    }, [message.content]);

    const timestamp = format(new Date(message.createdAt), DATE_FORMAT);
    const isUpdated = message.updatedAt !== message.createdAt;
    const member = message.member;

    const isAdmin = currentMember.role === MemberRole.ADMIN;
    const isModerator = currentMember.role === MemberRole.MODERATOR;
    const isOwner = currentMember.id === member.id;
    const canDeleteMessage =
        !message.deleted && (isAdmin || isModerator || isOwner);
    const canEditMessage = !message.deleted && isOwner && !message.fileUrl;

    const isPDF =
        message.fileType === AllowedFile.PDF && message.fileUrl ? true : false;
    const isImage = !isPDF && message.fileUrl ? true : false;

    return (
        <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
            <div className="group flex gap-x-2 items-start w-full">
                <div className="cursor-pointer hover:drop-shadow-md transition">
                    <UserAvatar
                        name={member.profile.name}
                        src={member.profile.imageUrl}
                    />
                </div>
                <div className="flex flex-col w-full">
                    <div className="flex items-center gap-x-2">
                        <div className="flex items-center">
                            <p className="font-semibold text-sm hover:underline cursor-pointer">
                                {member.profile.name}
                            </p>
                            <ActionTooltip label={member.role}>
                                {roleIconMap[member.role]}
                            </ActionTooltip>
                        </div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {timestamp}
                        </span>
                    </div>
                    {isImage && (
                        <a
                            href={message.fileUrl as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48"
                        >
                            <Image
                                src={message.fileUrl as string}
                                alt={message.content}
                                fill
                                className="object-cover"
                            />
                        </a>
                    )}
                    {isPDF && (
                        <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10 ">
                            <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
                            <a
                                href={message.fileUrl as string}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline break-words"
                            >
                                {message.content}
                            </a>
                        </div>
                    )}
                    {!message.fileUrl && !isEditing && (
                        <p
                            className={cn(
                                "text-sm text-zinc-600 dark:text-zinc-300 flex items-center",
                                message.deleted &&
                                    "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
                            )}
                        >
                            {message.content}
                            {isUpdated && !message.deleted && (
                                <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                                    (edited)
                                </span>
                            )}
                        </p>
                    )}
                    {!message.fileUrl && isEditing && (
                        <Form {...form}>
                            <form
                                className="flex items-center w-full gap-x-2 pt-2"
                                onSubmit={form.handleSubmit(onSubmit)}
                            >
                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <div className="relative w-full">
                                                    <Input
                                                        disabled={isLoading}
                                                        className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                                                        placeholder="Edited message"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    disabled={isLoading}
                                    size="sm"
                                    variant="primary"
                                >
                                    Save
                                </Button>
                            </form>
                            <span className="text-xs mt-1 text-zinc-400">
                                Press &laquo;Esc&raquo; to cancel,
                                &laquo;Enter&raquo; to save
                            </span>
                        </Form>
                    )}
                </div>
            </div>
            {canDeleteMessage && (
                <div className="hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
                    {canEditMessage && (
                        <ActionTooltip label="Edit" side="top">
                            <Edit
                                onClick={() => setIsEditing(true)}
                                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
                            />
                        </ActionTooltip>
                    )}
                    <ActionTooltip label="Delete" side="top">
                        <Trash className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition" />
                    </ActionTooltip>
                </div>
            )}
        </div>
    );
}

export default MessageItem;
