// Local Lucide SVGs, pinned to lucide-static 1.57.0; see assets/icons/lucide/SOURCE.json.
import {escapeHtml as e} from './content.mjs';
const names=['external-link','chevron-up','chevron-down','x','arrow-up','chevrons-right','sparkles','check'];
export const UI_ICON_FILES=Object.freeze(names.map(name=>`assets/icons/lucide/${name}.svg`));
export function uiIcon(name,cls=''){
  if(!names.includes(name))throw new Error('Ícone não registrado.');
  return `<span class="ui-icon ${e(cls)}" style="--ui-icon:url('assets/icons/lucide/${name}.svg')" aria-hidden="true"></span>`;
}
