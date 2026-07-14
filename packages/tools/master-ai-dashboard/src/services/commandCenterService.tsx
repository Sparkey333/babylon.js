import { type IDisposable } from "core/index";
import { Observable, type IReadonlyObservable } from "core/Misc/observable";
import { type IService, type ServiceDefinition } from "shared-ui-components/modularTool/modularity/serviceDefinition";
import { type IShellService, ShellServiceIdentity } from "shared-ui-components/modularTool/services/shellService";
import { useObservableState } from "shared-ui-components/modularTool/hooks/observableHooks";
import { AppsRegular } from "@fluentui/react-icons";
import { useCallback, useState } from "react";
import { CommandCenter, type CommandCenterFilter } from "../components/commandCenter/commandCenter";
import { type Project } from "../data/projects";
import { type LifeZoneId } from "../data/lifeZones";
import { createLogEntry } from "../types";
import { type ICockpitService, CockpitServiceIdentity } from "./cockpitService";
import { type IDebugConsoleService, DebugConsoleServiceIdentity } from "./debugConsoleService";

export const CommandCenterServiceIdentity = Symbol("CommandCenterService");

export interface ICommandCenterService extends IService<typeof CommandCenterServiceIdentity> {
    readonly selectedProjectId: string | null;
    readonly filter: CommandCenterFilter;
    readonly searchQuery: string;
    readonly onStateChanged: IReadonlyObservable<void>;
    selectProject(project: Project): void;
    setFilter(filter: CommandCenterFilter): void;
    setSearchQuery(query: string): void;
    focusZone(zoneId: LifeZoneId): void;
}

export const CommandCenterServiceDefinition: ServiceDefinition<[ICommandCenterService], [IShellService, ICockpitService, IDebugConsoleService]> = {
    friendlyName: "Command Center Service",
    produces: [CommandCenterServiceIdentity],
    consumes: [ShellServiceIdentity, CockpitServiceIdentity, DebugConsoleServiceIdentity],
    factory: (shellService, cockpitService, debugService) => {
        const onStateChanged = new Observable<void>();
        let selectedProjectId: string | null = null;
        let filter: CommandCenterFilter = "all";
        let searchQuery = "";

        const notify = () => onStateChanged.notifyObservers();

        const selectProject = (project: Project) => {
            selectedProjectId = project.id;
            cockpitService.sceneApi?.highlightProject(project);
            debugService.addLog(createLogEntry("info", project.zone, `Focused project: ${project.name} [${project.status}]`));
            notify();
        };

        const setFilter = (f: CommandCenterFilter) => {
            filter = f;
            if (f !== "all") cockpitService.sceneApi?.focusZone(f);
            notify();
        };

        const setSearchQuery = (q: string) => {
            searchQuery = q;
            notify();
        };

        const focusZone = (zoneId: LifeZoneId) => {
            cockpitService.sceneApi?.focusZone(zoneId);
            debugService.addLog(createLogEntry("debug", "cockpit", `Camera locked to zone: ${zoneId}`));
        };

        const sidePaneRegistration = shellService.addSidePane({
            key: "CommandCenter",
            title: "Command Center",
            icon: AppsRegular,
            horizontalLocation: "left",
            verticalLocation: "top",
            teachingMoment: false,
            content: () => {
                const currentFilter = useObservableState(() => filter, onStateChanged);
                const currentSearch = useObservableState(() => searchQuery, onStateChanged);
                const currentSelected = useObservableState(() => selectedProjectId, onStateChanged);

                const onSelect = useCallback((p: Project) => selectProject(p), []);
                const onFilter = useCallback((f: CommandCenterFilter) => setFilter(f), []);
                const onSearch = useCallback((q: string) => setSearchQuery(q), []);
                const onFocus = useCallback((z: LifeZoneId) => focusZone(z), []);

                return (
                    <CommandCenter
                        selectedProjectId={currentSelected}
                        filter={currentFilter}
                        searchQuery={currentSearch}
                        onFilterChange={onFilter}
                        onSearchChange={onSearch}
                        onSelectProject={onSelect}
                        onFocusZone={onFocus}
                    />
                );
            },
        });

        debugService.addLog(createLogEntry("info", "system", "Master AI Command Center online"));

        return {
            get selectedProjectId() {
                return selectedProjectId;
            },
            get filter() {
                return filter;
            },
            get searchQuery() {
                return searchQuery;
            },
            onStateChanged,
            selectProject,
            setFilter,
            setSearchQuery,
            focusZone,
            dispose: () => {
                onStateChanged.clear();
                sidePaneRegistration.dispose();
            },
        } satisfies ICommandCenterService & IDisposable;
    },
};
