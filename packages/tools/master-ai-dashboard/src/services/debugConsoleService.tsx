import { type IDisposable } from "core/index";
import { Observable, type IReadonlyObservable } from "core/Misc/observable";
import { type IService, type ServiceDefinition } from "shared-ui-components/modularTool/modularity/serviceDefinition";
import { type IShellService, ShellServiceIdentity } from "shared-ui-components/modularTool/services/shellService";
import { useObservableState } from "shared-ui-components/modularTool/hooks/observableHooks";
import { BugRegular, EyeRegular } from "@fluentui/react-icons";
import { useCallback } from "react";
import { DebugConsole } from "../components/debug/debugConsole";
import { createLogEntry, type DebugLogEntry } from "../types";
import { Button } from "shared-ui-components/fluent/primitives/button";

export const DebugConsoleServiceIdentity = Symbol("DebugConsoleService");

export interface IDebugConsoleService extends IService<typeof DebugConsoleServiceIdentity> {
    readonly logs: readonly DebugLogEntry[];
    readonly onStateChanged: IReadonlyObservable<void>;
    addLog(entry: DebugLogEntry): void;
    clearLogs(): void;
}

const MAX_LOGS = 200;

export const DebugConsoleServiceDefinition: ServiceDefinition<[IDebugConsoleService], [IShellService]> = {
    friendlyName: "Debug Console Service",
    produces: [DebugConsoleServiceIdentity],
    consumes: [ShellServiceIdentity],
    factory: (shellService) => {
        const onStateChanged = new Observable<void>();
        const logs: DebugLogEntry[] = [
            createLogEntry("info", "cockpit", "3D viewport initializing..."),
            createLogEntry("debug", "hud", "Retro scanline overlay active"),
            createLogEntry("info", "pinterest", "Inspiration module loaded (demo mode)"),
        ];

        const notify = () => onStateChanged.notifyObservers();

        const addLog = (entry: DebugLogEntry) => {
            logs.push(entry);
            if (logs.length > MAX_LOGS) logs.shift();
            notify();
        };

        const clearLogs = () => {
            logs.length = 0;
            addLog(createLogEntry("info", "system", "Log buffer cleared"));
        };

        const bottomPaneRegistration = shellService.addSidePane({
            key: "DebugBay",
            title: "Debug Bay",
            icon: BugRegular,
            horizontalLocation: "right",
            verticalLocation: "bottom",
            teachingMoment: false,
            content: () => {
                const currentLogs = useObservableState(() => logs, onStateChanged);
                const onClear = useCallback(() => clearLogs(), []);
                return <DebugConsole logs={currentLogs} onClear={onClear} />;
            },
        });

        const toolbarRegistration = shellService.addToolbarItem({
            key: "InspectScene",
            horizontalLocation: "left",
            verticalLocation: "bottom",
            teachingMoment: false,
            component: () => {
                const handleInspect = useCallback(() => {
                    addLog(createLogEntry("debug", "inspector", "Scene inspection requested — wire Inspector.Show() here"));
                }, []);
                return <Button title="Inspect 3D Scene" appearance="transparent" icon={EyeRegular} onClick={handleInspect} />;
            },
        });

        return {
            get logs() {
                return logs;
            },
            onStateChanged,
            addLog,
            clearLogs,
            dispose: () => {
                onStateChanged.clear();
                bottomPaneRegistration.dispose();
                toolbarRegistration.dispose();
            },
        } satisfies IDebugConsoleService & IDisposable;
    },
};
