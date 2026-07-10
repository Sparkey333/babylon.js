import { MakeModularTool } from "shared-ui-components/modularTool/modularTool";
import { CockpitServiceDefinition } from "./services/cockpitService";
import { CommandCenterServiceDefinition } from "./services/commandCenterService";
import { InspirationServiceDefinition } from "./services/inspirationService";
import { DebugConsoleServiceDefinition } from "./services/debugConsoleService";

MakeModularTool({
    namespace: "MasterAIDashboard",
    containerElement: document.getElementById("root")!,
    serviceDefinitions: [
        CockpitServiceDefinition,
        DebugConsoleServiceDefinition,
        CommandCenterServiceDefinition,
        InspirationServiceDefinition,
    ],
    toolbarMode: "compact",
    showThemeSelector: false,
    leftPaneDefaultWidth: 340,
    leftPaneMinWidth: 280,
    rightPaneDefaultWidth: 320,
    rightPaneMinWidth: 260,
});
