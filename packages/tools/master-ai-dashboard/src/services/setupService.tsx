import { type IDisposable } from "core/index";
import { type ServiceDefinition } from "shared-ui-components/modularTool/modularity/serviceDefinition";
import { type IShellService, ShellServiceIdentity } from "shared-ui-components/modularTool/services/shellService";
import { SettingsRegular, OpenRegular } from "@fluentui/react-icons";
import { useCallback } from "react";
import { Button } from "shared-ui-components/fluent/primitives/button";
import { SetupGuide } from "../components/setup/setupGuide";

export const SetupServiceIdentity = Symbol("SetupService");

export const SetupServiceDefinition: ServiceDefinition<[], [IShellService]> = {
    friendlyName: "Setup & Keys Service",
    produces: [],
    consumes: [ShellServiceIdentity],
    factory: (shellService) => {
        const sidePaneRegistration = shellService.addSidePane({
            key: "SetupKeys",
            title: "Setup & Keys",
            icon: SettingsRegular,
            horizontalLocation: "left",
            verticalLocation: "bottom",
            order: 10,
            teachingMoment: false,
            content: () => <SetupGuide />,
        });

        const toolbarRegistration = shellService.addToolbarItem({
            key: "OpenSetupHtml",
            horizontalLocation: "right",
            verticalLocation: "bottom",
            teachingMoment: false,
            component: () => {
                const openSetup = useCallback(() => {
                    window.open("./setup.html", "_blank", "noopener,noreferrer");
                }, []);
                return <Button title="Setup HTML (keys & DMG steps)" appearance="transparent" icon={OpenRegular} onClick={openSetup} />;
            },
        });

        return {
            dispose: () => {
                sidePaneRegistration.dispose();
                toolbarRegistration.dispose();
            },
        } satisfies IDisposable;
    },
};
