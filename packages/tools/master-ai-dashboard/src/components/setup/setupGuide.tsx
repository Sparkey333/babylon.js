import { makeStyles, tokens, Text, Button, Badge } from "@fluentui/react-components";
import { OpenRegular, CopyRegular, CheckmarkRegular } from "@fluentui/react-icons";
import { useCallback, useState } from "react";
import { KEY_SITE_LINKS, SETUP_STEPS, LOCAL_ENV_TEMPLATE, type SetupLink } from "../../data/setupGuide";

const useStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: '"Share Tech Mono", monospace',
    },
    header: {
        padding: tokens.spacingVerticalM,
        borderBottom: `1px solid rgba(0, 229, 255, 0.25)`,
    },
    title: {
        fontFamily: '"Orbitron", sans-serif',
        fontSize: tokens.fontSizeBase300,
        color: "#00e5ff",
        letterSpacing: "0.15em",
        marginBottom: tokens.spacingVerticalXS,
    },
    subtitle: {
        fontSize: tokens.fontSizeBase100,
        color: "#5a7a99",
        marginBottom: tokens.spacingVerticalS,
        lineHeight: 1.4,
    },
    actions: {
        display: "flex",
        gap: tokens.spacingHorizontalS,
        flexWrap: "wrap",
    },
    scroll: {
        flex: 1,
        overflowY: "auto",
        padding: tokens.spacingVerticalM,
    },
    step: {
        marginBottom: tokens.spacingVerticalL,
        padding: tokens.spacingVerticalS,
        borderLeft: `2px solid rgba(0, 229, 255, 0.35)`,
        paddingLeft: tokens.spacingHorizontalM,
    },
    stepTitle: {
        fontFamily: '"Orbitron", sans-serif',
        fontSize: tokens.fontSizeBase200,
        color: "#c8e8ff",
        letterSpacing: "0.06em",
        marginBottom: tokens.spacingVerticalXS,
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalS,
        flexWrap: "wrap",
    },
    stepBody: {
        fontSize: tokens.fontSizeBase100,
        color: "#8aa4bf",
        lineHeight: 1.5,
        marginBottom: tokens.spacingVerticalS,
    },
    links: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalXS,
    },
    linkRow: {
        display: "flex",
        alignItems: "flex-start",
        gap: tokens.spacingHorizontalS,
        flexWrap: "wrap",
    },
    linkNote: {
        fontSize: "10px",
        color: "#5a7a99",
    },
    sitesSection: {
        marginTop: tokens.spacingVerticalM,
        paddingTop: tokens.spacingVerticalM,
        borderTop: `1px solid rgba(0, 229, 255, 0.15)`,
    },
    sitesTitle: {
        fontFamily: '"Orbitron", sans-serif',
        fontSize: tokens.fontSizeBase200,
        color: "#ff00aa",
        letterSpacing: "0.12em",
        marginBottom: tokens.spacingVerticalS,
    },
    siteCard: {
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        padding: tokens.spacingVerticalXS,
        marginBottom: tokens.spacingVerticalXS,
        borderRadius: tokens.borderRadiusSmall,
        border: `1px solid rgba(255, 0, 170, 0.15)`,
        backgroundColor: "rgba(4, 8, 24, 0.6)",
    },
    envBox: {
        marginTop: tokens.spacingVerticalM,
        padding: tokens.spacingVerticalS,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        border: `1px solid rgba(0, 229, 255, 0.2)`,
        borderRadius: tokens.borderRadiusMedium,
        fontSize: "10px",
        color: "#7ec8e3",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
        fontFamily: '"Share Tech Mono", monospace',
        lineHeight: 1.45,
    },
});

function LinkButton({ link }: { link: SetupLink }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
                appearance="subtle"
                size="small"
                icon={<OpenRegular />}
                onClick={() => window.open(link.url, "_blank", "noopener,noreferrer")}
            >
                {link.label}
            </Button>
            {link.note && (
                <span style={{ fontSize: 10, color: "#5a7a99", paddingLeft: 8 }}>{link.note}</span>
            )}
            <span
                style={{
                    fontSize: 9,
                    color: "rgba(0, 229, 255, 0.45)",
                    paddingLeft: 8,
                    wordBreak: "break-all",
                }}
            >
                {link.url}
            </span>
        </div>
    );
}

export function SetupGuide() {
    const styles = useStyles();
    const [copied, setCopied] = useState(false);

    const copyEnv = useCallback(() => {
        void navigator.clipboard.writeText(LOCAL_ENV_TEMPLATE).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }, []);

    const openStandalone = useCallback(() => {
        window.open("./setup.html", "_blank", "noopener,noreferrer");
    }, []);

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <Text className={styles.title}>SETUP · KEYS · MAC</Text>
                <Text className={styles.subtitle}>
                    Clear steps + official URLs for API keys. Target: this local Mac. After packaging,
                    refresh Finder and open the new .dmg.
                </Text>
                <div className={styles.actions}>
                    <Button appearance="primary" icon={<OpenRegular />} onClick={openStandalone}>
                        Open setup.html
                    </Button>
                    <Button
                        appearance="subtle"
                        icon={copied ? <CheckmarkRegular /> : <CopyRegular />}
                        onClick={copyEnv}
                    >
                        {copied ? "Copied .env" : "Copy .env template"}
                    </Button>
                </div>
            </div>

            <div className={styles.scroll}>
                {SETUP_STEPS.map((step) => (
                    <section key={step.id} className={styles.step}>
                        <Text className={styles.stepTitle}>
                            {step.title}
                            {step.localMacOnly && (
                                <Badge appearance="outline" size="small" color="informative">
                                    Mac local
                                </Badge>
                            )}
                        </Text>
                        <Text className={styles.stepBody}>{step.body}</Text>
                        {step.links && (
                            <div className={styles.links}>
                                {step.links.map((link) => (
                                    <div key={link.url} className={styles.linkRow}>
                                        <LinkButton link={link} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                ))}

                <section className={styles.sitesSection}>
                    <Text className={styles.sitesTitle}>KEY SITES (ALL URLS)</Text>
                    {KEY_SITE_LINKS.map((site) => (
                        <div key={site.url} className={styles.siteCard}>
                            <LinkButton link={site} />
                        </div>
                    ))}
                </section>

                <section className={styles.sitesSection}>
                    <Text className={styles.sitesTitle}>.ENV TEMPLATE (LOCAL MAC)</Text>
                    <pre className={styles.envBox}>{LOCAL_ENV_TEMPLATE}</pre>
                </section>
            </div>
        </div>
    );
}
