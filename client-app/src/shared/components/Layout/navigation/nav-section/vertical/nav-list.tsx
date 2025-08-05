// @mui
import Collapse from '@mui/material/Collapse'
import { useCallback, useEffect, useState } from 'react'

import { useLocation } from 'react-router-dom'

import { useActiveLink } from '../../../../../hooks/useActiveLink.ts'
//
import { NavConfigProps, NavListProps } from '../types.ts'
import NavItem from './nav-item.tsx'

// ----------------------------------------------------------------------

type NavListRootProps = {
  data: NavListProps
  depth: number
  hasChild: boolean
  config: NavConfigProps
}

export default function NavList({ data, depth, hasChild, config }: NavListRootProps) {
  const { pathname } = useLocation()

  const active = useActiveLink(data.path, hasChild)

  const externalLink = data.path.includes('http')

  const [open, setOpen] = useState(active)

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!active) {
      handleClose()
    }
  }, [pathname])

  const handleToggle = useCallback(() => {
    setOpen((prev: any) => !prev)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  return (
    <>
      <NavItem
        item={data}
        depth={depth}
        open={open}
        active={active}
        externalLink={externalLink}
        onClick={handleToggle}
        config={config}
      />

      {hasChild && (
        <Collapse in={open} unmountOnExit>
          <NavSubList data={data.children} depth={depth} config={config} />
        </Collapse>
      )}
    </>
  )
}

// ----------------------------------------------------------------------

type NavListSubProps = {
  data: NavListProps[]
  depth: number
  config: NavConfigProps
}

function NavSubList({ data, depth, config }: NavListSubProps) {
  return (
    <>
      {data.map((list) => (
        <NavList
          key={list.title + list.path}
          data={list}
          depth={depth + 1}
          hasChild={!!list.children}
          config={config}
        />
      ))}
    </>
  )
}
