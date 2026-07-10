import { makeStyles, tokens, Text, Badge, ProgressBar } from "@fluentui/react-components";
import { type Project } from "../../data/projects";
import { getLifeZone } from "../../data/lifeZones";
import { STATUS_LABELS } from "../../types";

const useStyles = makeStyles({
    card: {
        padding: tokens.spacingVerticalS,
        borderRadius: tokens.borderRadiusMedium,
        border: `1px solid rgba(0, 229, 255, 0.2)`,
        backgroundColor: "rgba(4, 8, 24, 0.85)",
        cursor: "pointer",
        transitionProperty: "border-color, box-shadow, transform",
        transitionDuration: "150ms",
        ":hover": {
            borderTopColor: "rgba(0, 229, 255, 0.5)",
            borderRightColor: "rgba(0, 229, 255, 0.5)",
            borderBottomColor: "rgba(0, 229, 255, 0.5)",
            borderLeftColor: "rgba(0, 229, 255, 0.5)",
            boxShadow: "0 0 16px rgba(0, 229, 255, 0.15)",
            transform: "translateX(2px)",
        },
    },
    cardSelected: {
        borderTopColor: "rgba(255, 0, 170, 0.6)",
        borderRightColor: "rgba(255, 0, 170, 0.6)",
        borderBottomColor: "rgba(255, 0, 170, 0.6)",
        borderLeftColor: "rgba(255, 0, 170, 0.6)",
        boxShadow: "0 0 20px rgba(255, 0, 170, 0.2)",
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: tokens.spacingHorizontalS,
        marginBottom: tokens.spacingVerticalXS,
    },
    name: {
        fontFamily: '"Orbitron", sans-serif',
        fontSize: tokens.fontSizeBase200,
        color: "#c8e8ff",
        fontWeight: tokens.fontWeightSemibold,
    },
    description: {
        fontSize: tokens.fontSizeBase100,
        color: "#5a7a99",
        marginBottom: tokens.spacingVerticalXS,
        lineHeight: 1.4,
    },
    meta: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalS,
        flexWrap: "wrap",
    },
    tag: {
        fontSize: "10px",
        color: "rgba(0, 229, 255, 0.6)",
        fontFamily: '"Share Tech Mono", monospace',
    },
    lastActive: {
        fontSize: "10px",
        color: "#5a7a99",
        marginLeft: "auto",
        fontFamily: '"Share Tech Mono", monospace',
    },
    progress: {
        marginTop: tokens.spacingVerticalXS,
    },
});

export interface ProjectCardProps {
    project: Project;
    selected: boolean;
    onSelect: (project: Project) => void;
}

export function ProjectCard({ project, selected, onSelect }: ProjectCardProps) {
    const styles = useStyles();
    const zone = getLifeZone(project.zone);
    const statusColor =
        project.status === "debugging" ? "#ff3333" : project.status === "active" ? zone.color : "#5a7a99";

    return (
        <div
            className={`${styles.card} ${selected ? styles.cardSelected : ""}`}
            onClick={() => onSelect(project)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onSelect(project)}
        >
            <div className={styles.header}>
                <Text className={styles.name}>
                    {project.pinned ? "★ " : ""}
                    {project.name}
                </Text>
                <Badge appearance="outline" color={project.status === "debugging" ? "danger" : "informative"} size="small">
                    {STATUS_LABELS[project.status]}
                </Badge>
            </div>
            <Text className={styles.description}>{project.description}</Text>
            <div className={styles.meta}>
                {project.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                        #{tag}
                    </span>
                ))}
                <span className={styles.lastActive}>{project.lastActive}</span>
            </div>
            <ProgressBar
                className={styles.progress}
                value={project.progress}
                max={100}
                thickness="medium"
                color={statusColor as "brand"}
            />
        </div>
    );
}
