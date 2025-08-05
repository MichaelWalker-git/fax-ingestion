import SvgColor from '../svg-color'
import { PROCESSING_FLOW_PATH, ROOT_PATH } from '../../constants/routes.ts'

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />

const ICONS = {
  recent: icon('ic_recent'),
  uploadFile: icon('ic_upload_file'),
  processed: icon('processed'),
  flowBuilder: icon('ic_account_tree'),
}

export const navData = [
  {
    items: [{ title: 'documents', path: ROOT_PATH, icon: ICONS.uploadFile }],
  },
  {
    subheader: 'other',
    items: [{ title: 'Flow Builder', path: PROCESSING_FLOW_PATH, icon: ICONS.flowBuilder }],
  },
]
