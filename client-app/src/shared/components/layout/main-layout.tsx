import { Outlet } from 'react-router';
import Stack from '@mui/material/Stack';
import Main from './main.tsx';
import Header from '../header/Header.tsx';

export default function MainLayout() {
  return (
    <Stack flexDirection="row" bgcolor="background.default">
      <Main>
        <Header />
        <Outlet />
      </Main>
    </Stack>
  );
}
