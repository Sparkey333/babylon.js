import { type IDisposable, type IReadonlyObservable } from "core/index";
import { Observable } from "core/Misc/observable";
import { type IService, type ServiceDefinition } from "shared-ui-components/modularTool/modularity/serviceDefinition";
import { type IShellService, ShellServiceIdentity } from "shared-ui-components/modularTool/services/shellService";
import { useCallback } from "react";
import { CockpitViewport } from "../components/cockpitViewport";
import { type CockpitSceneApi } from "../types";

export const CockpitServiceIdentity = Symbol("CockpitService");

export interface ICockpitService extends IService<typeof CockpitServiceIdentity> {
    readonly sceneApi: CockpitSceneApi | undefined;
    readonly onStateChanged: IReadonlyObservable<void>;
}

export const CockpitServiceDefinition: ServiceDefinition<[ICockpitService], [IShellService]> = {
    friendlyName: "Cockpit Service",
    produces: [CockpitServiceIdentity],
    consumes: [ShellServiceIdentity],
    factory: (shellService) => {
        const onStateChanged = new Observable<void>();
        let sceneApi: CockpitSceneApi | undefined;

        const handleSceneReady = (api: CockpitSceneApi) => {
            sceneApi = api;
            api.setCameraSensitivity(1.2);
            onStateChanged.notifyObservers();
        };

        const contentRegistration = shellService.addCentralContent({
            key: "Cockpit",
            component: () => {
                const onReady = useCallback((api: CockpitSceneApi) => handleSceneReady(api), []);
                return <CockpitViewport onSceneReady={onReady} />;
            },
        });

        return {
            get sceneApi() {
                return sceneApi;
            },
            onStateChanged,
            dispose: () => {
                onStateChanged.clear();
                contentRegistration.dispose();
            },
        } satisfies ICockpitService & IDisposable;
    },
};
