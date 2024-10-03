interface ServerPageProps {
    params: {
        serverId: string;
    };
}

function ServerPage({ params: { serverId } }: ServerPageProps) {
    return <div>ServerPage</div>;
}

export default ServerPage;
