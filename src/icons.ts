import { LabIcon } from '@jupyterlab/ui-components';

import webdsSvg from '../style/icons/synaptics-logo.svg';
import configurationSvg from '../style/icons/tools-svgrepo-com.svg';

export const webdsIcon = new LabIcon({
  name: 'webds_doc_launcher:webds_icon',
  svgstr: webdsSvg
});

export const configurationIcon = new LabIcon({
  name: 'webds_config_launcher:configuration_icon',
  svgstr: configurationSvg
});
