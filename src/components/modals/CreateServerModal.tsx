"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
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
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import "@uploadthing/react/styles.css";
import FileUpload from "../FileUpload";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/useModalStore";
import { useState } from "react";
import {
    FieldChangeProps,
    onFileFieldChange,
} from "../utils/onFormFileFieldChange";

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Server name is required",
    }),
    imageUrl: z.string().min(1, {
        message: "Server image is required",
    }),
});

function CreateServerModal() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm({
        defaultValues: {
            name: "",
            imageUrl: "",
        },
        resolver: zodResolver(formSchema),
    });

    const { isOpen, onClose, type } = useModal();
    const router = useRouter();
    const isLoading = form.formState.isSubmitting;
    const [uploadErrors, setUploadErrors] = useState("");

    const isModalOpen = isOpen && type === "createServer";

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.post("/api/servers", values);
            router.refresh();
            handleClose();
        } catch (error) {
            console.log("error :>> ", error);
        }
    };

    const onChange = (fields: FieldChangeProps, field: any) => {
        onFileFieldChange(fields, form, field);
    };

    function handleClose() {
        form.reset();
        onClose();
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Create your server
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Give your server a personality with a name and an image.
                        You can always change it later.
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
                                    name="imageUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <FileUpload
                                                    endpoint="serverImage"
                                                    value={field.value}
                                                    onChange={(fields) =>
                                                        onChange(fields, field)
                                                    }
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

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                                            Server name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                placeholder="Enter server name"
                                                className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className="bg-gray-100 px-6 py-4">
                            <Button variant="primary" disabled={isLoading}>
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default CreateServerModal;
