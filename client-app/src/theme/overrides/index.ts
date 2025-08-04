import { Theme } from '@mui/material/styles'
import { deepmerge } from '@mui/utils'
import Accordion from './components/accordion.tsx'
import Alert from './components/alert.tsx'
import AppBar from './components/appbar.tsx'
import Autocomplete from './components/autocomplete.tsx'
import Avatar from './components/avatar.tsx'
import Backdrop from './components/backdrop.tsx'
import Badge from './components/badge.tsx'
import Breadcrumbs from './components/breadcrumbs.tsx'
import Button from './components/button.tsx'
import ButtonGroup from './components/button-group.tsx'
import Card from './components/card.tsx'
import Checkbox from './components/checkbox.tsx'
import Chip from './components/chip.tsx'
import Container from './components/container.tsx'
import CssBaseline from './components/css-baseline.tsx'
import DataGrid from './components/data-grid.tsx'
import MuiDatePicker from './components/date-picker.tsx'
import Dialog from './components/dialog.tsx'
import Drawer from './components/drawer.tsx'
//
import Fab from './components/fab.tsx'
import Link from './components/link.tsx'
import Lists from './components/list.tsx'
import LoadingButton from './components/loading-button.tsx'
import Menu from './components/menu.tsx'
import Pagination from './components/pagination.tsx'
import Paper from './components/paper.tsx'
import Popover from './components/popover.tsx'
import Progress from './components/progress.tsx'
import RadioButton from './components/radio-button.tsx'
import Rating from './components/rating.tsx'
import Select from './components/select.tsx'
import Skeleton from './components/skeleton.tsx'
import Slider from './components/slider.tsx'
import Stack from './components/stack.tsx'
import Stepper from './components/stepper.tsx'
import SvgIcon from './components/svg-icon.tsx'
import Switch from './components/switch.tsx'
import Table from './components/table.tsx'
import Tabs from './components/tabs.tsx'
import TextField from './components/textfield.tsx'
import Timeline from './components/timeline.tsx'
import ToggleButton from './components/toggle-button.tsx'
import Tooltip from './components/tooltip.tsx'
import TreeView from './components/tree-view.tsx'
import Typography from './components/typography.tsx'

// ----------------------------------------------------------------------

export function componentsOverrides(theme: Theme) {
  const overridesArray = [
    Fab(theme),
    Tabs(theme),
    Chip(theme),
    Card(theme),
    Menu(theme),
    Link(),
    Stack(),
    Badge(theme),
    Lists(theme),
    Table(theme),
    Paper(theme),
    Alert(theme),
    Switch(theme),
    Select(),
    Button(theme),
    Rating(theme),
    Dialog(theme),
    AppBar(),
    Avatar(theme),
    Slider(theme),
    Drawer(theme),
    Stepper(theme),
    Tooltip(theme),
    Popover(theme),
    SvgIcon(),
    Checkbox(theme),
    DataGrid(theme),
    Skeleton(theme),
    Timeline(theme),
    TreeView(theme),
    Backdrop(theme),
    Progress(theme),
    TextField(theme),
    Accordion(theme),
    Typography(theme),
    Pagination(theme),
    RadioButton(theme),
    ButtonGroup(theme),
    Breadcrumbs(theme),
    CssBaseline(),
    Autocomplete(theme),
    ToggleButton(theme),
    MuiDatePicker(theme),
    LoadingButton(),
    Container(theme),
  ]

  const components = overridesArray.reduce((acc, curr) => deepmerge(acc, curr), {})

  return components
}
