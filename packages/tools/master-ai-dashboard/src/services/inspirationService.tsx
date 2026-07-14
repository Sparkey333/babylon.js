import { type IDisposable } from "core/index";
import { Observable, type IReadonlyObservable } from "core/Misc/observable";
import { type IService, type ServiceDefinition } from "shared-ui-components/modularTool/modularity/serviceDefinition";
import { type IShellService, ShellServiceIdentity } from "shared-ui-components/modularTool/services/shellService";
import { useObservableState } from "shared-ui-components/modularTool/hooks/observableHooks";
import { PinRegular } from "@fluentui/react-icons";
import { useCallback } from "react";
import { PinterestBoard } from "../components/inspiration/pinterestBoard";

export const InspirationServiceIdentity = Symbol("InspirationService");

export interface IInspirationService extends IService<typeof InspirationServiceIdentity> {
    readonly onStateChanged: IReadonlyObservable<void>;
}

export const InspirationServiceDefinition: ServiceDefinition<[IInspirationService], [IShellService]> = {
    friendlyName: "Inspiration Service",
    produces: [InspirationServiceIdentity],
    consumes: [ShellServiceIdentity],
    factory: (shellService) => {
        const onStateChanged = new Observable<void>();

        const sidePaneRegistration = shellService.addSidePane({
            key: "Inspiration",
            title: "Pinterest",
            icon: PinRegular,
            horizontalLocation: "right",
            verticalLocation: "top",
            teachingMoment: false,
            content: () => <PinterestBoard />,
        });

        return {
            onStateChanged,
            dispose: () => {
                onStateChanged.clear();
                sidePaneRegistration.dispose();
            },
        } satisfies IInspirationService & IDisposable;
    },
};
