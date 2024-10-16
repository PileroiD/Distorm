"use client";

import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import "@uploadthing/react/styles.css";
import FileUpload from "../FileUpload";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useModal } from "@/hooks/useModalStore";
import qs from "query-string";

const formSchema = z.object({
    fileUrl: z.string().min(1, {
        message: "Attachment is required",
    }),
});

function MessageFileModal() {
    const {
        isOpen,
        onClose,
        type,
        data: { apiUrl, query },
    } = useModal();
    const isModalOpen = isOpen && type === "messageFile";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm({
        defaultValues: {
            fileUrl: "",
        },
        resolver: zodResolver(formSchema),
    });

    const [uploadErrors, setUploadErrors] = useState("");

    const router = useRouter();
    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: apiUrl || "",
                query,
            });

            await axios.post(url, { ...values, content: values.fileUrl });
            form.reset();
            router.refresh();
            onClose();
        } catch (error) {
            console.log("error :>> ", error);
        }
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Add an attachment
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Send a file as a message
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        <div className="space-y-8 px-6">
                            <div className="flex items-center justify-center text-center">
                                <FormField
                                    control={form.control}
                                    name="fileUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <FileUpload
                                                    endpoint="messageFile"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    setUploadErrors={
                                                        setUploadErrors
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            {uploadErrors && (
                                                <div className="text-red-800 font-semibold">
                                                    {uploadErrors}
                                                </div>
                                            )}
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <DialogFooter className="bg-gray-100 px-6 py-4">
                            <Button variant="primary" disabled={isLoading}>
                                Send
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default MessageFileModal;
