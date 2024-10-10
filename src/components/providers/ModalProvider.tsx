"use client";

import { useEffect, useState } from "react";
import CreateServerModal from "../modals/CreateServerModal";
import InviteModal from "../modals/InviteModal";
import EditServerSettingsModal from "../modals/EditSettingsModal";
import ManageServerMembersModal from "../modals/ManageMembersModal";

export const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <CreateServerModal />
            <InviteModal />
            <EditServerSettingsModal />
            <ManageServerMembersModal />
        </>
    );
};
