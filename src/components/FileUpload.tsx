"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { UploadDropzone } from "@/lib/uploadthing";
import { Json } from "@uploadthing/shared";
import { FileIcon, X } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { UploadThingError } from "uploadthing/server";
import { FieldChangeProps } from "./utils/onFormFileFieldChange";

const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];

interface FileUploadProps {
    endpoint: "messageFile" | "serverImage";
    onChange: (fields: FieldChangeProps) => void;
    value: string;
    setUploadErrors: Dispatch<SetStateAction<string>>;
}

function FileUpload({
    endpoint,
    onChange,
    value,
    setUploadErrors,
}: FileUploadProps) {
    const [file, setFile] = useState<Record<string, string>>({
        fileType: "",
        fileName: "",
        fileUrl: value,
    });

    if (value && file.fileType === "application/pdf" && file.fileUrl) {
        return (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10 ">
                <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
                <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline break-words"
                >
                    {file.fileName}
                </a>
                <button
                    onClick={() =>
                        setFile((prev) => ({ ...prev, fileUrl: "" }))
                    }
                    className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm"
                    type="button"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    }

    if (
        (value && endpoint === "serverImage" && file.fileUrl) ||
        (value && allowedImageTypes.includes(file.fileType!) && file.fileUrl)
    ) {
        return (
            <div className="relative h-20 w-20">
                <Image
                    fill
                    src={file.fileUrl}
                    alt="upload"
                    className="rounded-full object-cover"
                />
                <button
                    onClick={() =>
                        setFile((prev) => ({ ...prev, fileUrl: "" }))
                    }
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
                onChange({
                    fileUrl: res[0]?.url,
                    fileType: res[0]?.type,
                    fileName: res[0]?.name,
                });
                setUploadErrors("");
                setFile((prev) => ({
                    ...prev,
                    fileType: res[0]?.type,
                    fileName: res[0]?.name,
                    fileUrl: res[0]?.url,
                }));
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
