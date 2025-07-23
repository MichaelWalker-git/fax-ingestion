import { Theme } from '@mui/material/styles'
import { deepmerge } from '@mui/utils'
import Accordion from './components/accordion'
import Alert from './components/alert'
import AppBar from './components/appbar'
import Autocomplete from './components/autocomplete'
import Avatar from './components/avatar'
import Backdrop from './components/backdrop'
import Badge from './components/badge'
import Breadcrumbs from './components/breadcrumbs'
import Button from './components/button'
import ButtonGroup from './components/button-group'
import Card from './components/card'
import Checkbox from './components/checkbox'
import Chip from './components/chip'
import Container from './components/container'
import CssBaseline from './components/css-baseline'
import DataGrid from './components/data-grid'
import MuiDatePicker from './components/date-picker'
import Dialog from './components/dialog'
import Drawer from './components/drawer'
//
import Fab from './components/fab'
import Link from './components/link'
import Lists from './components/list'
import LoadingButton from './components/loading-button'
import Menu from './components/menu'
import Pagination from './components/pagination'
import Paper from './components/paper'
import Popover from './components/popover'
import Progress from './components/progress'
import RadioButton from './components/radio-button'
import Rating from './components/rating'
import Select from './components/select'
import Skeleton from './components/skeleton'
import Slider from './components/slider'
import Stack from './components/stack'
import Stepper from './components/stepper'
import SvgIcon from './components/svg-icon'
import Switch from './components/switch'
import Table from './components/table'
import Tabs from './components/tabs'
import TextField from './components/textfield'
import Timeline from './components/timeline'
import ToggleButton from './components/toggle-button'
import Tooltip from './components/tooltip'
import TreeView from './components/tree-view'
import Typography from './components/typography'

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
