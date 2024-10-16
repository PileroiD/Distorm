"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { Json } from "@uploadthing/shared";
import { FileIcon, X } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { UploadThingError } from "uploadthing/server";

interface FileUploadProps {
    endpoint: "messageFile" | "serverImage";
    onChange: (url?: string) => void;
    value: string;
    setUploadErrors: Dispatch<SetStateAction<string>>;
}

const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];

function FileUpload({
    endpoint,
    onChange,
    value,
    setUploadErrors,
}: FileUploadProps) {
    const [fileType, setFileType] = useState<null | string>(null);

    if (value && fileType === "application/pdf") {
        return (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10 ">
                <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
                <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline break-words"
                >
                    {value.length > 50 ? value.slice(0, 50) + "..." : value}
                </a>
                <button
                    onClick={() => onChange("")}
                    className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm"
                    type="button"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    }

    if (
        (value && endpoint === "serverImage") ||
        (value && allowedImageTypes.includes(fileType!))
    ) {
        return (
            <div className="relative h-20 w-20">
                <Image
                    fill
                    src={value}
                    alt="upload"
                    className="rounded-full object-cover"
                />
                <button
                    onClick={() => onChange("")}
                    className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
                    type="button"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return (
        <UploadDropzone
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
                onChange(res[0]?.url);
                setUploadErrors("");
                setFileType(res[0]?.type);
            }}
            onUploadError={(error: UploadThingError<Json>) => {
                console.log("error upload:>> ", error.message);

                if (error.message === "Invalid config: FileSizeMismatch") {
                    return setUploadErrors("Large file size");
                }

                setUploadErrors(error.message);
            }}
        />
    );
}

export default FileUpload;
