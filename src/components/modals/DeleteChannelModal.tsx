"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import "@uploadthing/react/styles.css";
import { useModal } from "@/hooks/useModalStore";
import { useState } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import qs from "query-string";

function DeleteChannelModal() {
    const {
        isOpen,
        onClose,
        type,
        data: { channel, server },
    } = useModal();
    const isModalOpen = isOpen && type === "deleteChannel";
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const onConfirmDeleteChannel = async () => {
        try {
            setIsLoading(true);

            const url = qs.stringifyUrl({
                url: `/api/channels/${channel?.id}`,
                query: {
                    serverId: server?.id,
                },
            });

            axios.delete(url);
            onClose();
            router.refresh();
        } catch (err) {
            console.log("err :>> ", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Delete channel
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Are you sure You want to delete{" "}
                        <span className="font-semibold text-indigo-500">
                            {channel?.name}
                        </span>
                        ? <br /> This channel will be completely deleted
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="bg-gray-100 px-6 py-4">
                    <div className="flex items-center justify-between w-full">
                        <Button
                            disabled={isLoading}
                            onClick={onClose}
                            variant="ghost"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={isLoading}
                            onClick={onConfirmDeleteChannel}
                            variant="primary"
                        >
                            Confirm
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default DeleteChannelModal;
