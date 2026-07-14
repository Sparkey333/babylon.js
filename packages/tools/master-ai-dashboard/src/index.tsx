import { MakeModularTool } from "shared-ui-components/modularTool/modularTool";
import { CockpitServiceDefinition } from "./services/cockpitService";
import { CommandCenterServiceDefinition } from "./services/commandCenterService";
import { InspirationServiceDefinition } from "./services/inspirationService";
import { DebugConsoleServiceDefinition } from "./services/debugConsoleService";
import { SetupServiceDefinition } from "./services/setupService";

MakeModularTool({
    namespace: "MasterAIDashboard",
    containerElement: document.getElementById("root")!,
    serviceDefinitions: [
        CockpitServiceDefinition,
        DebugConsoleServiceDefinition,
        SetupServiceDefinition,
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

// Mark shell for optional bootstrap-chip cleanup in index.html
document.documentElement.setAttribute("data-master-ai-shell", "1");
