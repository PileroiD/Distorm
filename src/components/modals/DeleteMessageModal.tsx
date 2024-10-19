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
import qs from "query-string";
import { useRouter } from "next/navigation";

function DeleteMessageModal() {
    const router = useRouter();

    const {
        isOpen,
        onClose,
        type,
        data: { apiUrl, query },
    } = useModal();
    const isModalOpen = isOpen && type === "deleteMessage";
    const [isLoading, setIsLoading] = useState(false);

    const onConfirmDeleteMessage = async () => {
        try {
            setIsLoading(true);

            const url = qs.stringifyUrl({
                url: apiUrl || "",
                query,
            });

            await axios.delete(url);
            router.refresh();
            onClose();
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
                        Delete message
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Are you sure You want to delete this message?
                        <br />
                        The message will be completely deleted
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
                            onClick={onConfirmDeleteMessage}
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

export default DeleteMessageModal;
