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
import React, { useState } from "react";
import {
    FieldChangeProps,
    onFileFieldChange,
} from "../utils/onFormFileFieldChange";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "../ui/hover-card";
import { ArrowBigDown, CalendarIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Server } from "@prisma/client";
import { format } from "date-fns";

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Server name is required",
    }),
    imageUrl: z.string().min(1, {
        message: "Server image is required",
    }),
});

interface InitialModalProps {
    initServers:
        | (Server & {
              _count: {
                  members: number;
              };
          })[]
        | null;
}

function InitialModal({ initServers }: InitialModalProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm({
        defaultValues: {
            name: "",
            imageUrl: "",
        },
        resolver: zodResolver(formSchema),
    });

    const [uploadErrors, setUploadErrors] = useState("");

    const router = useRouter();
    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.post("/api/servers", values);
            form.reset();
            router.refresh();
        } catch (error) {
            console.log("error :>> ", error);
        }
    };

    const onChange = (fields: FieldChangeProps, field: any) => {
        onFileFieldChange(fields, form, field);
    };

    return (
        <Dialog open>
            <DialogContent className="bg-white text-black p-0 max-w-4xl">
                <div className="md:flex overflow-y-auto max-h-[600px]">
                    <div>
                        <DialogHeader className="pt-8 px-6">
                            <DialogTitle className="text-2xl text-center font-bold">
                                Customize your server
                            </DialogTitle>
                            <DialogDescription className="text-center text-zinc-500">
                                Give your server a personality with a name and
                                an image. You can always change it later.
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
                                                            onChange={(
                                                                fields
                                                            ) =>
                                                                onChange(
                                                                    fields,
                                                                    field
                                                                )
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
                                <DialogFooter className="bg-gray-100 px-6 py-4 rounded-md">
                                    <Button
                                        variant="primary"
                                        disabled={isLoading}
                                    >
                                        Create
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </div>
                    <ArrowBigDown className="h-6 w-full text-zinc-500 md:hidden text-center" />
                    <div className="md:h-full md:w-[2px] md:mt-0 bg-gray-300 w-1/2 mx-auto h-[2px] mt-8" />
                    <div className="mb-11 md:mb-0">
                        <DialogHeader className="pt-8 px-6 mb-10">
                            <DialogTitle className="text-2xl text-center font-bold">
                                Or join these servers
                            </DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center">
                            {!!initServers?.length ? (
                                initServers?.map((server) => (
                                    <HoverCard key={server.id}>
                                        <HoverCardTrigger
                                            asChild
                                            className="w-2/3 bg-zinc-100 transition rounded-md mb-2 hover:bg-purple-100"
                                        >
                                            <Button
                                                onClick={() =>
                                                    router.push(
                                                        `/invite/${server.inviteCode}`
                                                    )
                                                }
                                                variant="link"
                                                className="text-black text-lg font-semibold"
                                            >
                                                @{server.name}
                                            </Button>
                                        </HoverCardTrigger>
                                        <HoverCardContent
                                            className="w-80"
                                            side="left"
                                        >
                                            <div className="flex gap-3">
                                                <Avatar>
                                                    <AvatarImage
                                                        src={server?.imageUrl}
                                                        className="object-cover"
                                                    />
                                                    <AvatarFallback>
                                                        {server.name.slice(
                                                            0,
                                                            2
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h4 className="text-sm font-semibold ">
                                                        @{server.name}
                                                    </h4>
                                                    <p className="text-sm text-zinc-400">
                                                        members:{" "}
                                                        {server._count.members}
                                                    </p>
                                                    <div className="flex items-center pt-2">
                                                        <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                                                        <span className="text-xs text-muted-foreground">
                                                            Created:{" "}
                                                            {format(
                                                                server.createdAt,
                                                                "MM/dd/yyyy"
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </HoverCardContent>
                                    </HoverCard>
                                ))
                            ) : (
                                <div className="text-zinc-500 font-semibold">
                                    There are no servers yet
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default InitialModal;
