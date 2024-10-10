import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
    name: string;
    src?: string;
    className?: string;
}

function UserAvatar({ name, src, className }: UserAvatarProps) {
    return (
        <Avatar className={cn("h-7 w-7 md:h-10 md:w-10", className)}>
            <AvatarImage src={src} />
            <AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
        </Avatar>
    );
}

export default UserAvatar;
