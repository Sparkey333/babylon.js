import { makeStyles, tokens, Text, Badge } from "@fluentui/react-components";
import { type LifeZone } from "../../data/lifeZones";
import { type Project } from "../../data/projects";
import { ProjectCard } from "./projectCard";

const useStyles = makeStyles({
    zone: {
        marginBottom: tokens.spacingVerticalM,
    },
    zoneHeader: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalS,
        marginBottom: tokens.spacingVerticalS,
        paddingBottom: tokens.spacingVerticalXS,
        borderBottom: `1px solid rgba(0, 229, 255, 0.15)`,
        cursor: "pointer",
    },
    zoneIcon: {
        fontSize: "18px",
    },
    zoneLabel: {
        fontFamily: '"Orbitron", sans-serif',
        fontSize: tokens.fontSizeBase200,
        fontWeight: tokens.fontWeightSemibold,
        letterSpacing: "0.12em",
    },
    zoneDesc: {
        fontSize: tokens.fontSizeBase100,
        color: "#5a7a99",
        marginLeft: "auto",
        maxWidth: "45%",
        textAlign: "right",
        display: "none",
        "@media (min-width: 480px)": {
            display: "block",
        },
    },
    projects: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalXS,
    },
    empty: {
        fontSize: tokens.fontSizeBase100,
        color: "#5a7a99",
        fontStyle: "italic",
        padding: tokens.spacingVerticalS,
    },
});

export interface LifeZonePanelProps {
    zone: LifeZone;
    projects: readonly Project[];
    selectedProjectId: string | null;
    onSelectProject: (project: Project) => void;
    onFocusZone: (zoneId: LifeZone["id"]) => void;
}

export function LifeZonePanel({ zone, projects, selectedProjectId, onSelectProject, onFocusZone }: LifeZonePanelProps) {
    const styles = useStyles();
    const activeCount = projects.filter((p) => p.status === "active" || p.status === "debugging").length;

    return (
        <section className={styles.zone}>
            <div className={styles.zoneHeader} onClick={() => onFocusZone(zone.id)} role="button" tabIndex={0}>
                <span className={styles.zoneIcon}>{zone.icon}</span>
                <Text className={styles.zoneLabel} style={{ color: zone.color }}>
                    {zone.label.toUpperCase()}
                </Text>
                <Badge appearance="outline" size="small">
                    {activeCount} live
                </Badge>
                <Text className={styles.zoneDesc}>{zone.description}</Text>
            </div>
            <div className={styles.projects}>
                {projects.length === 0 ? (
                    <Text className={styles.empty}>No projects in this zone</Text>
                ) : (
                    projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            selected={selectedProjectId === project.id}
                            onSelect={onSelectProject}
                        />
                    ))
                )}
            </div>
        </section>
    );
}
