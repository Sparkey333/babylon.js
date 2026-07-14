import { useState, useCallback } from "react";
import { makeStyles, tokens, Text, Button, Dropdown, Option, Badge, Image } from "@fluentui/react-components";
import { PinRegular, LinkRegular, ArrowSyncRegular } from "@fluentui/react-icons";
import {
    DEMO_PINS,
    DEMO_BOARDS,
    loadPinterestState,
    savePinterestState,
    type PinterestPin,
} from "../../data/pinterest";
import { KEY_SITES } from "../../data/setupGuide";

const useStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: '"Share Tech Mono", monospace',
    },
    header: {
        padding: tokens.spacingVerticalM,
        borderBottom: `1px solid rgba(255, 0, 170, 0.25)`,
    },
    title: {
        fontFamily: '"Orbitron", sans-serif',
        fontSize: tokens.fontSizeBase300,
        color: "#ff00aa",
        letterSpacing: "0.15em",
        marginBottom: tokens.spacingVerticalXS,
    },
    subtitle: {
        fontSize: tokens.fontSizeBase100,
        color: "#5a7a99",
        marginBottom: tokens.spacingVerticalS,
    },
    connectRow: {
        display: "flex",
        gap: tokens.spacingHorizontalS,
        alignItems: "center",
        flexWrap: "wrap",
        marginBottom: tokens.spacingVerticalS,
    },
    boardSelect: {
        minWidth: "160px",
        flex: 1,
    },
    grid: {
        flex: 1,
        overflowY: "auto",
        padding: tokens.spacingVerticalM,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: tokens.spacingHorizontalS,
        alignContent: "start",
    },
    pin: {
        position: "relative",
        borderRadius: tokens.borderRadiusMedium,
        overflow: "hidden",
        border: `1px solid rgba(255, 0, 170, 0.2)`,
        cursor: "pointer",
        aspectRatio: "4/3",
        transitionProperty: "border-color, box-shadow",
        transitionDuration: "150ms",
        ":hover": {
            borderTopColor: "rgba(255, 0, 170, 0.5)",
            borderRightColor: "rgba(255, 0, 170, 0.5)",
            borderBottomColor: "rgba(255, 0, 170, 0.5)",
            borderLeftColor: "rgba(255, 0, 170, 0.5)",
            boxShadow: "0 0 16px rgba(255, 0, 170, 0.2)",
        },
    },
    pinImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    pinOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: tokens.spacingVerticalXS,
        background: "linear-gradient(transparent, rgba(5, 5, 16, 0.9))",
    },
    pinTitle: {
        fontSize: "10px",
        color: "#c8e8ff",
        lineHeight: 1.3,
    },
    pinBoard: {
        fontSize: "9px",
        color: "#ff00aa",
        opacity: 0.8,
    },
    statusBar: {
        padding: tokens.spacingVerticalS,
        borderTop: `1px solid rgba(255, 0, 170, 0.15)`,
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalS,
        fontSize: tokens.fontSizeBase100,
        color: "#5a7a99",
    },
});

export function PinterestBoard() {
    const styles = useStyles();
    const [connection, setConnection] = useState(loadPinterestState);
    const [selectedBoard, setSelectedBoard] = useState<string>(connection.selectedBoardId ?? "all");
    const [refreshing, setRefreshing] = useState(false);

    const pins: readonly PinterestPin[] = DEMO_PINS;
    const filteredPins =
        selectedBoard === "all" ? pins : pins.filter((p) => DEMO_BOARDS.find((b) => b.id === selectedBoard)?.name === p.boardName);

    const handleConnect = useCallback(() => {
        const next = { connected: true, username: "commander", selectedBoardId: selectedBoard === "all" ? null : selectedBoard };
        setConnection(next);
        savePinterestState(next);
    }, [selectedBoard]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 800);
    }, []);

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <Text className={styles.title}>
                    <PinRegular /> INSPIRATION
                </Text>
                <Text className={styles.subtitle}>
                    Pinterest mood boards — get App ID / Secret from the Apps Console, then Setup & Keys.
                </Text>
                <div className={styles.connectRow}>
                    {!connection.connected ? (
                        <>
                            <Button appearance="primary" icon={<LinkRegular />} onClick={handleConnect}>
                                Connect Pinterest
                            </Button>
                            <Button appearance="subtle" onClick={() => window.open(KEY_SITES.pinterestAppsConsole, "_blank", "noopener,noreferrer")}>
                                Apps Console (keys)
                            </Button>
                            <Button appearance="subtle" onClick={() => window.open(KEY_SITES.pinterestSetUpApp, "_blank", "noopener,noreferrer")}>
                                Set up app
                            </Button>
                            <Button appearance="subtle" onClick={() => window.open("./setup.html", "_blank", "noopener,noreferrer")}>
                                Full setup steps
                            </Button>
                        </>
                    ) : (
                        <Badge appearance="filled" color="success">
                            @{connection.username}
                        </Badge>
                    )}
                    <Dropdown
                        className={styles.boardSelect}
                        placeholder="Select board"
                        value={selectedBoard === "all" ? "All Boards" : DEMO_BOARDS.find((b) => b.id === selectedBoard)?.name}
                        onOptionSelect={(_, data) => setSelectedBoard(data.optionValue ?? "all")}
                    >
                        <Option value="all">All Boards</Option>
                        {DEMO_BOARDS.map((board) => (
                            <Option key={board.id} value={board.id}>
                                {board.name} ({board.pinCount})
                            </Option>
                        ))}
                    </Dropdown>
                    <Button appearance="subtle" icon={<ArrowSyncRegular />} onClick={handleRefresh} disabled={refreshing} />
                </div>
            </div>
            <div className={styles.grid}>
                {filteredPins.map((pin) => (
                    <div
                        key={pin.id}
                        className={styles.pin}
                        onClick={() => pin.link && window.open(pin.link, "_blank")}
                        role="button"
                        tabIndex={0}
                    >
                        <Image className={styles.pinImage} src={pin.imageUrl} alt={pin.title} />
                        <div className={styles.pinOverlay}>
                            <Text className={styles.pinTitle}>{pin.title}</Text>
                            <Text className={styles.pinBoard}>{pin.boardName}</Text>
                        </div>
                    </div>
                ))}
            </div>
            <div className={styles.statusBar}>
                {connection.connected ? "Live sync ready" : "Demo mode"} · {filteredPins.length} pins ·{" "}
                <a href={KEY_SITES.pinterestAuth} target="_blank" rel="noopener noreferrer" style={{ color: "#ff00aa" }}>
                    OAuth docs
                </a>
                {refreshing && " · refreshing..."}
            </div>
        </div>
    );
}
