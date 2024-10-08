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

function DeleteServerModal() {
    const {
        isOpen,
        onClose,
        type,
        data: { server },
    } = useModal();
    const isModalOpen = isOpen && type === "deleteServer";
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const onConfirmDeleteServer = async () => {
        try {
            setIsLoading(true);

            await axios.delete(`/api/servers/${server?.id}`);
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
                        Delete server
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Are you sure You want to delete{" "}
                        <span className="font-semibold text-indigo-500">
                            {server?.name}
                        </span>
                        ? <br /> This server will be completely deleted
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
                            onClick={onConfirmDeleteServer}
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

export default DeleteServerModal;
