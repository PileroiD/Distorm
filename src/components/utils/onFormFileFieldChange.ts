/* eslint-disable @typescript-eslint/no-explicit-any */

export interface FieldChangeProps {
    fileName: string;
    fileType: string;
    fileUrl: string;
}

export const onFileFieldChange = (
    fileInfo: FieldChangeProps,
    form: any,
    field: any
) => {
    const { name } = field;

    const valueMap: Record<string, keyof FieldChangeProps> = {
        name: "fileName",
        imageUrl: "fileUrl",
    };

    if (valueMap[name]) {
        form.setValue(name, fileInfo[valueMap[name]]);
    } else {
        Object.entries(fileInfo).forEach(([key, value]) => {
            form.setValue(key, value);
        });
    }
};
