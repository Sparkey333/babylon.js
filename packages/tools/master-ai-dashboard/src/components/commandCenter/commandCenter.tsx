import { useMemo } from "react";
import { makeStyles, tokens, Text, Input, Tab, TabList } from "@fluentui/react-components";
import { SearchRegular } from "@fluentui/react-icons";
import { LIFE_ZONES, type LifeZoneId } from "../../data/lifeZones";
import { DEFAULT_PROJECTS, projectsByZone, activeProjectCount, type Project } from "../../data/projects";
import { LifeZonePanel } from "./lifeZonePanel";

const useStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        fontFamily: '"Share Tech Mono", monospace',
    },
    header: {
        padding: tokens.spacingVerticalM,
        borderBottom: `1px solid rgba(0, 229, 255, 0.2)`,
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
    },
    search: {
        marginBottom: tokens.spacingVerticalS,
    },
    tabs: {
        marginBottom: tokens.spacingVerticalS,
    },
    scroll: {
        flex: 1,
        overflowY: "auto",
        padding: tokens.spacingVerticalM,
    },
    stats: {
        display: "flex",
        gap: tokens.spacingHorizontalL,
        fontSize: tokens.fontSizeBase100,
        color: "#5a7a99",
        marginTop: tokens.spacingVerticalXS,
    },
    statValue: {
        color: "#c8e8ff",
        fontWeight: tokens.fontWeightSemibold,
    },
});

export type CommandCenterFilter = "all" | LifeZoneId;

export interface CommandCenterProps {
    selectedProjectId: string | null;
    filter: CommandCenterFilter;
    searchQuery: string;
    onFilterChange: (filter: CommandCenterFilter) => void;
    onSearchChange: (query: string) => void;
    onSelectProject: (project: Project) => void;
    onFocusZone: (zoneId: LifeZoneId) => void;
}

export function CommandCenter({
    selectedProjectId,
    filter,
    searchQuery,
    onFilterChange,
    onSearchChange,
    onSelectProject,
    onFocusZone,
}: CommandCenterProps) {
    const styles = useStyles();

    const filteredProjects = useMemo(() => {
        let list = [...DEFAULT_PROJECTS];
        if (filter !== "all") list = list.filter((p) => p.zone === filter);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q) ||
                    p.tags.some((t) => t.toLowerCase().includes(q))
            );
        }
        return list;
    }, [filter, searchQuery]);

    const zonesToShow = filter === "all" ? LIFE_ZONES : LIFE_ZONES.filter((z) => z.id === filter);

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <Text className={styles.title}>COMMAND CENTER</Text>
                <Text className={styles.subtitle}>Life zones · always-on project bays</Text>
                <Input
                    className={styles.search}
                    contentBefore={<SearchRegular />}
                    placeholder="Search projects, tags..."
                    value={searchQuery}
                    onChange={(_, data) => onSearchChange(data.value)}
                />
                <TabList
                    className={styles.tabs}
                    selectedValue={filter}
                    onTabSelect={(_, data) => onFilterChange(data.value as CommandCenterFilter)}
                    size="small"
                >
                    <Tab value="all">All</Tab>
                    {LIFE_ZONES.map((z) => (
                        <Tab key={z.id} value={z.id}>
                            {z.icon}
                        </Tab>
                    ))}
                </TabList>
                <div className={styles.stats}>
                    <span>
                        <span className={styles.statValue}>{activeProjectCount(DEFAULT_PROJECTS)}</span> active
                    </span>
                    <span>
                        <span className={styles.statValue}>{DEFAULT_PROJECTS.length}</span> total
                    </span>
                    <span>
                        <span className={styles.statValue}>{LIFE_ZONES.length}</span> zones
                    </span>
                </div>
            </div>
            <div className={styles.scroll}>
                {zonesToShow.map((zone) => (
                    <LifeZonePanel
                        key={zone.id}
                        zone={zone}
                        projects={projectsByZone(filteredProjects, zone.id)}
                        selectedProjectId={selectedProjectId}
                        onSelectProject={onSelectProject}
                        onFocusZone={onFocusZone}
                    />
                ))}
            </div>
        </div>
    );
}
