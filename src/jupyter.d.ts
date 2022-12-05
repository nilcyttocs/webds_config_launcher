import { ILauncher } from "@jupyterlab/launcher";
import { IIterator } from '@lumino/algorithm';

declare module "@jupyterlab/launcher" {
  interface ILauncher {
    items(): IIterator<ILauncher.IItemOptions>;
  }
}
