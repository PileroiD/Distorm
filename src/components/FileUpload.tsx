"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { Json } from "@uploadthing/shared";
import { X } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import { UploadThingError } from "uploadthing/server";

interface FileUploadProps {
    endpoint: "messageFile" | "serverImage";
    onChange: (url?: string) => void;
    value: string;
    setUploadErrors: Dispatch<SetStateAction<string>>;
}

function FileUpload({
    endpoint,
    onChange,
    value,
    setUploadErrors,
}: FileUploadProps) {
    const fileType = value?.split(".").pop();

    if (value && fileType !== "pdf") {
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
