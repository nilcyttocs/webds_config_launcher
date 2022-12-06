import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from "@jupyterlab/application";

import { WidgetTracker } from "@jupyterlab/apputils";

import { ILauncher } from "@jupyterlab/launcher";

import { Widget } from "@lumino/widgets";

import { WebDSService, WebDSWidget } from "@webds/service";

import { WebDSConfigLauncher } from "./launcher";

import { configurationIcon } from "./icons";

namespace Attributes {
  export const command = "webds_config_launcher:open";
  export const id = "webds_config_launcher_widget";
  export const label = "Library";
  export const caption = "Library";
  export const category = "Touch - Configuration";
  export const rank = 20;
}

/**
 * Initialization data for the @webds/config_launcher extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: "@webds/config_launcher:plugin",
  autoStart: true,
  requires: [ILauncher, ILayoutRestorer],
  optional: [WebDSService],
  activate: async (
    app: JupyterFrontEnd,
    launcher: ILauncher,
    restorer: ILayoutRestorer,
    service: WebDSService | null
  ) => {
    console.log("JupyterLab extension @webds/config_launcher is activated!");

    let widget: WebDSWidget;
    const { commands, shell } = app;
    const command = Attributes.command;
    commands.addCommand(command, {
      label: Attributes.label,
      caption: Attributes.caption,
      icon: (args: { [x: string]: any }) =>
        args["isLauncher"] ? configurationIcon : undefined,
      execute: () => {
        if (!widget || widget.isDisposed) {
          const callback = (item: Widget): void => {
            shell.add(item, "main");
          };
          const configLauncher = new WebDSConfigLauncher(
            commands,
            launcher.items(),
            callback,
            service
          );
          widget = new WebDSWidget({ content: configLauncher });
          widget.id = Attributes.id;
          widget.title.label = Attributes.label;
          widget.title.icon = configurationIcon;
          widget.title.closable = true;
        }

        if (!tracker.has(widget)) tracker.add(widget);

        if (!widget.isAttached) shell.add(widget, "main");

        shell.activateById(widget.id);
      }
    });

    launcher.add({
      command,
      args: { isLauncher: true },
      category: Attributes.category,
      rank: Attributes.rank
    });

    let tracker = new WidgetTracker<WebDSWidget>({
      namespace: Attributes.id
    });
    restorer.restore(tracker, { command, name: () => Attributes.id });
  }
};

export default plugin;
