import { useEffect, useRef } from "react";
import { makeStyles, tokens, Text, Badge, Button } from "@fluentui/react-components";
import { DeleteRegular, ArrowDownloadRegular } from "@fluentui/react-icons";
import { type DebugLogEntry } from "../../types";

const useStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: '"Share Tech Mono", monospace',
        backgroundColor: "rgba(4, 6, 16, 0.95)",
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
        borderBottom: `1px solid rgba(255, 51, 51, 0.25)`,
    },
    title: {
        fontFamily: '"Orbitron", sans-serif',
        fontSize: tokens.fontSizeBase200,
        color: "#ff3333",
        letterSpacing: "0.12em",
    },
    actions: {
        display: "flex",
        gap: tokens.spacingHorizontalXS,
    },
    logArea: {
        flex: 1,
        overflowY: "auto",
        padding: tokens.spacingVerticalS,
        fontSize: "11px",
        lineHeight: 1.5,
    },
    entry: {
        display: "flex",
        gap: tokens.spacingHorizontalS,
        padding: `${tokens.spacingVerticalXXS} 0`,
        borderBottom: `1px solid rgba(255, 255, 255, 0.04)`,
    },
    timestamp: {
        color: "#5a7a99",
        flexShrink: 0,
        width: "70px",
    },
    level: {
        flexShrink: 0,
        width: "48px",
        fontWeight: tokens.fontWeightSemibold,
    },
    source: {
        color: "#00e5ff",
        flexShrink: 0,
        maxWidth: "100px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    message: {
        color: "#c8e8ff",
        flex: 1,
        wordBreak: "break-word",
    },
    empty: {
        color: "#5a7a99",
        fontStyle: "italic",
        padding: tokens.spacingVerticalM,
    },
});

const LEVEL_COLORS: Record<DebugLogEntry["level"], string> = {
    info: "#00e5ff",
    warn: "#ffaa00",
    error: "#ff3333",
    debug: "#5a7a99",
};

export interface DebugConsoleProps {
    logs: readonly DebugLogEntry[];
    onClear: () => void;
}

export function DebugConsole({ logs, onClear }: DebugConsoleProps) {
    const styles = useStyles();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs.length]);

    const formatTime = (d: Date) =>
        d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const exportLogs = () => {
        const text = logs.map((l) => `[${formatTime(l.timestamp)}] [${l.level.toUpperCase()}] ${l.source}: ${l.message}`).join("\n");
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `master-ai-logs-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <Text className={styles.title}>DEBUG BAY</Text>
                <div className={styles.actions}>
                    <Badge appearance="outline" color="danger" size="small">
                        {logs.length} entries
                    </Badge>
                    <Button appearance="subtle" size="small" icon={<ArrowDownloadRegular />} onClick={exportLogs} title="Export logs" />
                    <Button appearance="subtle" size="small" icon={<DeleteRegular />} onClick={onClear} title="Clear logs" />
                </div>
            </div>
            <div className={styles.logArea}>
                {logs.length === 0 ? (
                    <Text className={styles.empty}>No log entries — systems nominal</Text>
                ) : (
                    logs.map((entry) => (
                        <div key={entry.id} className={styles.entry}>
                            <span className={styles.timestamp}>{formatTime(entry.timestamp)}</span>
                            <span className={styles.level} style={{ color: LEVEL_COLORS[entry.level] }}>
                                {entry.level.toUpperCase()}
                            </span>
                            <span className={styles.source}>{entry.source}</span>
                            <span className={styles.message}>{entry.message}</span>
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
