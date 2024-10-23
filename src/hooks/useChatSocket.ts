"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSocket } from "@/components/providers/SocketProvider";
import { Member, Message, Profile } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

type ChatSocketProps = {
    addKey: string;
    updateKey: string;
    queryKey: string;
};

type MessageWithMemberAndProfile = Message & {
    member: Member & {
        profile: Profile;
    };
};

export const useChatSocket = ({
    addKey,
    updateKey,
    queryKey,
}: ChatSocketProps) => {
    const { socket } = useSocket();
    const queryClient = useQueryClient();

    const onUpdateMessage = useCallback(
        (message: MessageWithMemberAndProfile) => {
            queryClient.setQueryData([queryKey], (oldData: any) => {
                if (!oldData || !oldData.pages || !oldData.pages.length) {
                    return oldData;
                }

                const newData = oldData.pages.map((page: any) => {
                    return {
                        ...page,
                        items: page.items.map(
                            (item: MessageWithMemberAndProfile) => {
                                if (item.id === message.id) {
                                    return message;
                                }
                                return item;
                            }
                        ),
                    };
                });

                return {
                    ...oldData,
                    pages: newData,
                };
            });
        },
        [queryKey, queryClient]
    );

    const onAddMessage = useCallback(
        (message: MessageWithMemberAndProfile) => {
            queryClient.setQueryData([queryKey], (oldData: any) => {
                if (!oldData || !oldData.pages || oldData.pages.length === 0) {
                    return {
                        pages: [
                            {
                                items: [message],
                            },
                        ],
                    };
                }

                const newData = [...oldData.pages];

                newData[0] = {
                    ...newData[0],
                    items: [message, ...newData[0].items],
                };

                return {
                    ...oldData,
                    pages: newData,
                };
            });
        },
        [queryKey, queryClient]
    );

    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.on(addKey, onAddMessage);
        socket.on(updateKey, onUpdateMessage);

        return () => {
            socket.off(addKey, onAddMessage);
            socket.off(updateKey, onUpdateMessage);
        };
    }, [
        queryClient,
        addKey,
        queryKey,
        updateKey,
        socket,
        onAddMessage,
        onUpdateMessage,
    ]);
};
