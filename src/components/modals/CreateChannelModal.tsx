"use client";

import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
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
import qs from "query-string";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import "@uploadthing/react/styles.css";
import { useParams, useRouter } from "next/navigation";
import { useModal } from "@/hooks/useModalStore";
import { ChannelType } from "@prisma/client";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { useEffect } from "react";

const formSchema = z.object({
    name: z
        .string()
        .min(1, {
            message: "Channel name is required",
        })
        .refine((name) => name !== "general", {
            message: `Channel name cannot be "general"`,
        }),
    type: z.nativeEnum(ChannelType),
});

function CreateChannelModal() {
    const {
        isOpen,
        onClose,
        type,
        data: { channelType },
    } = useModal();

    const form = useForm({
        defaultValues: {
            name: "",
            type: channelType || ChannelType.TEXT,
        },
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        if (channelType) {
            form.setValue("type", channelType);
        }
    }, [channelType, form]);

    const router = useRouter();
    const { serverId } = useParams();
    const isLoading = form.formState.isSubmitting;

    const isModalOpen = isOpen && type === "createChannel";

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const url = qs.stringifyUrl({
                url: `/api/channels`,
                query: {
                    serverId,
                },
            });

            await axios.post(url, values);
            router.refresh();
            onClose();
            form.reset();
        } catch (error) {
            console.log("error :>> ", error);
        }
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Create channel
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        <div className="space-y-8 px-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                                            Channel name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isLoading}
                                                placeholder="Enter channel name"
                                                className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                                            Channel type
                                        </FormLabel>
                                        <Select
                                            disabled={isLoading}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0 capitalize outline-none ring-offset-0 ring-0">
                                                    <SelectValue placeholder="Select a channel type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0">
                                                {Object.values(ChannelType).map(
                                                    (type) => (
                                                        <SelectItem
                                                            key={type}
                                                            className="bg-zinc-300/50"
                                                            value={type}
                                                        >
                                                            {type}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
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

export default CreateChannelModal;
