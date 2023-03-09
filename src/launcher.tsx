import * as React from 'react';

import { VDomRenderer } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';
import { classes, LabIcon } from '@jupyterlab/ui-components';
import { each, IIterator } from '@lumino/algorithm';
import { CommandRegistry } from '@lumino/commands';
import { AttachedProperty } from '@lumino/properties';
import { Widget } from '@lumino/widgets';
import { WebDSService } from '@webds/service';

const LAUNCHER_CLASS = 'jp-webdsConfigLauncher';

export class WebDSConfigLauncher extends VDomRenderer {
  constructor(
    commands: CommandRegistry,
    items: IIterator<ILauncher.IItemOptions>,
    callback: (widget: Widget) => void,
    service: WebDSService | null
  ) {
    super();
    this._items = items;
    this._commands = commands;
    this._callback = callback;
    this._service = service;
    this.addClass(LAUNCHER_CLASS);
  }

  get pending(): boolean {
    return this._pending;
  }
  set pending(value: boolean) {
    this._pending = value;
  }

  addToFavourites(item: ILauncher.IItemOptions): void {
    if (this._service) {
      const webdsLauncher = this._service.ui.getWebDSLauncher() as any;
      const webdsLauncherModel = this._service.ui.getWebDSLauncherModel() as any;
      if (webdsLauncherModel) {
        webdsLauncherModel.addToFavourites(item);
      }
      if (webdsLauncher) {
        webdsLauncher.update();
      }
    }
  }

  protected render(): React.ReactElement<any> | null {
    const configItems: any[] = [];
    each(this._items, item => {
      if (item.category == 'Device - Config Library') {
        configItems.push(item);
      }
    });

    if (configItems.length == 0) return null;

    configItems.sort((a: any, b: any) => {
      return Private.sortCmp(a, b, this._commands);
    });

    const cards: React.ReactElement<any>[] = [];

    configItems.forEach(item => {
      cards.push(Card(item, this, this._commands, this._callback));
    });

    const content: React.ReactElement<any> = (
      <div
        className="jp-webdsConfigLauncher-section"
        key={'webds_config_launcher'}
      >
        <div className="jp-webdsConfigLauncher-sectionHeader">
          <h2 className="jp-webdsConfigLauncher-sectionTitle">
            {'Device - Configuration Library'}
          </h2>
        </div>
        <div className="jp-webdsConfigLauncher-cardContainer">{cards}</div>
      </div>
    );

    return (
      <div className="jp-webdsConfigLauncher-body">
        <div className="jp-webdsConfigLauncher-content">
          <div className="jp-webdsConfigLauncher-content-main">{content}</div>
        </div>
      </div>
    );
  }

  private _items: IIterator<ILauncher.IItemOptions>;
  private _commands: CommandRegistry;
  private _callback: (widget: Widget) => void;
  private _pending = false;
  private _service: WebDSService | null;
}

function Card(
  item: ILauncher.IItemOptions,
  launcher: WebDSConfigLauncher,
  commands: CommandRegistry,
  launcherCallback: (widget: Widget) => void
): React.ReactElement<any> {
  const command = item.command;
  const args = { ...item.args };
  const label = commands.label(command, args);
  const caption = commands.caption(command, args);
  const iconClass = commands.iconClass(command, args);
  const _icon = commands.icon(command, args);
  const icon = _icon === iconClass ? undefined : _icon;

  const id = `webds-launcher-card-${label
    .replace(/ /g, '-')
    .replace(/[()]/g, '')}`;

  const onClickFactory = (
    item: ILauncher.IItemOptions
  ): ((event: any) => void) => {
    const onClick = (event: Event): void => {
      event.stopPropagation();
      if (launcher.pending === true) {
        return;
      }
      launcher.pending = true;
      void commands
        .execute(item.command, { ...item.args })
        .then(value => {
          launcher.pending = false;
          if (value instanceof Widget) {
            launcherCallback(value);
            launcher.dispose();
          }
        })
        .catch(reason => {
          launcher.pending = false;
          console.error(`Failed to launch launcher item\n${reason}`);
        });
    };

    return onClick;
  };

  const mainOnClick = onClickFactory(item);

  return (
    <div
      className="jp-webdsConfigLauncher-item"
      id={id}
      key={Private.keyProperty.get(item)}
      title={caption}
      onClick={mainOnClick}
    >
      <div className="jp-webdsConfigLauncherCard-icon">
        <LabIcon.resolveReact
          icon={icon}
          iconClass={classes(iconClass, 'jp-Icon-cover')}
          stylesheet="launcherCard"
        />
      </div>
      <div className="jp-webdsConfigLauncher-label" title={label}>
        {label}
      </div>
    </div>
  );
}

namespace Private {
  let id = 0;

  export const keyProperty = new AttachedProperty<
    ILauncher.IItemOptions,
    number
  >({
    name: 'key',
    create: (): number => id++
  });

  export function sortCmp(
    a: ILauncher.IItemOptions,
    b: ILauncher.IItemOptions,
    commands: CommandRegistry
  ): number {
    const r1 = a.rank;
    const r2 = b.rank;
    if (r1 !== r2 && r1 !== undefined && r2 !== undefined) {
      return r1 < r2 ? -1 : 1;
    }
    const aLabel = commands.label(a.command, { ...a.args });
    const bLabel = commands.label(b.command, { ...b.args });
    return aLabel.localeCompare(bLabel);
  }
}
