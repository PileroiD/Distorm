"use client";

import { Member, Message, Profile } from "@prisma/client";
import ChatWelcome from "./ChatWelcome";
import { useChatQuery } from "@/hooks/useChatQuery";
import { Loader2, ServerCrash } from "lucide-react";
import React from "react";
import MessageItem from "./MessageItem";
import { format } from "date-fns";

export type MessageWithMemberAndProfile = Message & {
    member: Member & {
        profile: Profile;
    };
};

interface ChatMessagesProps {
    name: string;
    member: Member;
    chatId: string;
    apiUrl: string;
    socketUrl: string;
    socketQuery: Record<string, string>;
    paramKey: "channelId" | "conversationId";
    paramValue: string;
    type: "channel" | "conversation";
}

function ChatMessages({
    name,
    member,
    chatId,
    apiUrl,
    socketUrl,
    socketQuery,
    paramKey,
    paramValue,
    type,
}: ChatMessagesProps) {
    const queryKey = `chat:${chatId}`;

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
        useChatQuery({ queryKey, apiUrl, paramKey, paramValue });

    if (status === "pending") {
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Loading messages...
                </p>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="flex flex-col flex-1 justify-center items-center">
                <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Something went wrong!
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col py-4 overflow-y-auto">
            <div className="flex-1" />
            <ChatWelcome type={type} name={name} />
            <div className="flex flex-col-reverse mt-auto">
                {data?.pages?.map((group, i) => (
                    <React.Fragment key={i}>
                        {group.items.map(
                            (message: MessageWithMemberAndProfile) => (
                                <MessageItem
                                    key={message.id}
                                    currentMember={member}
                                    message={message}
                                    socketUrl={socketUrl}
                                    socketQuery={socketQuery}
                                />
                            )
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

export default ChatMessages;
