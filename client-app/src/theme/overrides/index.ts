import { deepmerge } from '@mui/utils';
import { Theme } from '@mui/material/styles';
//
import Card from './components/card';
import Chip from './components/chip';
import Menu from './components/menu';
import Link from './components/link';
import Lists from './components/list';
import Table from './components/table';
import Alert from './components/alert';
import Badge from './components/badge';
import Paper from './components/paper';
import Stack from './components/stack';
import Drawer from './components/drawer';
import Dialog from './components/dialog';
import Rating from './components/rating';
import Slider from './components/slider';
import Button from './components/button';
import Select from './components/select';
import Tooltip from './components/tooltip';
import Popover from './components/popover';
import SvgIcon from './components/svg-icon';
import Skeleton from './components/skeleton';
import Backdrop from './components/backdrop';
import Checkbox from './components/checkbox';
import TextField from './components/textfield';
import Typography from './components/typography';
import Pagination from './components/pagination';
import Breadcrumbs from './components/breadcrumbs';
import CssBaseline from './components/css-baseline';
import RadioButton from './components/radio-button';
import ButtonGroup from './components/button-group';
import MuiDatePicker from './components/date-picker';
import ToggleButton from './components/toggle-button';
import LoadingButton from './components/loading-button';
import Container from './components/container.tsx';
import Tabs from './components/tabs.tsx';

// ----------------------------------------------------------------------

export function componentsOverrides(theme: Theme) {
  const overridesArray = [
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
    Select(),
    Button(theme),
    Rating(theme),
    Dialog(theme),
    Slider(theme),
    Drawer(theme),
    Tooltip(theme),
    Popover(theme),
    SvgIcon(),
    Checkbox(theme),
    Skeleton(theme),
    Backdrop(theme),
    TextField(theme),
    Typography(theme),
    Pagination(theme),
    RadioButton(theme),
    ButtonGroup(theme),
    Breadcrumbs(theme),
    CssBaseline(),
    ToggleButton(theme),
    MuiDatePicker(theme),
    LoadingButton(),
    Tabs(theme),
    Container(theme),
  ];

  const components = overridesArray.reduce((acc, curr) => deepmerge(acc, curr), {});

  return components;
}
