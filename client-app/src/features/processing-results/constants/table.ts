import { REVIEW_STATUSES } from '../../../constants/review.ts';

export const DEFAULT_ROWS_PER_PAGE = 25;

export const DOCUMENTS_TABLE_HEAD = [
  { id: 'filename', label: 'Name', width: 200, sortable: true },
  { id: 'patientFirstName', label: 'Patient First Name', width: 170, sortable: true },
  { id: 'patientLastName', label: 'Patient Last Name', width: 170, sortable: true },
  { id: 'status', label: 'Status', width: 130 },
  { id: 'reviewStatus', label: 'Review Status', width: 130 },
  { id: 'reviewComment', label: 'Review Comment', width: 300 },
  { id: 'updatedAt', label: 'Modified', width: 120, sortable: true },
  { id: 'createdAt', label: 'Created', width: 120, sortable: true },
  { id: '', width: 88 },
];

export const TABS = [
  { value: 'all', label: 'All Documents', icon: 'line-md:document' },
  {
    value: REVIEW_STATUSES.NOT_REVIEWED,
    label: REVIEW_STATUSES.NOT_REVIEWED,
    icon: 'ic:baseline-new-releases',
  },
  { value: REVIEW_STATUSES.APPROVED, label: REVIEW_STATUSES.APPROVED, icon: 'duo-icons:approved' },
  {
    value: REVIEW_STATUSES.REJECTED,
    label: REVIEW_STATUSES.REJECTED,
    icon: 'material-symbols:warning',
  },
] as const;
