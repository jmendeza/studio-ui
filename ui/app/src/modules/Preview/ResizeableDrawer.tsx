/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { DrawerProps } from '@material-ui/core';
import Drawer from '@material-ui/core/Drawer';
import React, { useCallback, useRef, useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import palette from '../../styles/palette';
import { CSSProperties } from '@material-ui/styles';

export type ResizeableDrawerClassKey =
  | 'root'
  | 'drawerBody'
  | 'drawerPaper'
  | 'resizeHandle'
  | 'resizeHandleActive'
  | 'resizeHandleLeft'
  | 'resizeHandleRight';

export type ResizeableDrawerStyles = Partial<Record<ResizeableDrawerClassKey, CSSProperties>>;

interface ResizeableDrawerProps extends DrawerProps {
  open: boolean;
  width: number;
  classes?: DrawerProps['classes'] & Partial<Record<ResizeableDrawerClassKey, string>>;
  styles?: ResizeableDrawerStyles;
  onWidthChange(width: number): void;
}

const useStyles = makeStyles((theme) =>
  createStyles<ResizeableDrawerClassKey, ResizeableDrawerStyles>({
    root: (styles) => ({
      flexShrink: 0,
      ...styles.root
    }),
    drawerBody: (styles) => ({
      width: '100%',
      overflowY: 'auto',
      ...styles.drawerBody
    }),
    drawerPaper: (styles) => ({
      top: 64,
      bottom: 0,
      height: 'auto',
      overflow: 'hidden',
      zIndex: theme.zIndex.appBar - 1,
      ...styles.drawerPaper
    }),
    resizeHandle: (styles) => ({
      width: '1px',
      cursor: 'ew-resize',
      padding: '4px 0 0',
      position: 'absolute',
      top: 0,
      bottom: 0,
      zIndex: 100,
      backgroundColor: 'rgba(0, 0, 0, 0.12)',
      transition: 'width 200ms',
      '&:hover': {
        width: '4px',
        visibility: 'visible',
        backgroundColor: palette.blue.tint
      },
      ...styles.resizeHandle
    }),
    resizeHandleLeft: (styles) => ({
      left: -1,
      ...styles.resizeHandleLeft
    }),
    resizeHandleRight: (styles) => ({
      right: -1,
      ...styles.resizeHandleRight
    }),
    resizeHandleActive: (styles) => ({
      width: '4px',
      visibility: 'visible',
      backgroundColor: palette.blue.tint,
      ...styles.resizeHandleActive
    })
  })
);

export default function ResizeableDrawer(props: ResizeableDrawerProps) {
  const classes = useStyles(props.styles);
  const [resizeActive, setResizeActive] = useState(false);

  const drawerRef = useRef<HTMLElement>();

  const {
    open,
    children,
    width,
    onWidthChange,
    className,
    classes: propsClasses = {},
    PaperProps,
    anchor = 'left',
    ...rest
  } = props;

  const {
    root,
    drawerBody,
    drawerPaper,
    resizeHandle,
    resizeHandleActive,
    resizeHandleLeft,
    resizeHandleRight,
    ...drawerClasses
  } = propsClasses;

  const handleMouseMove = useCallback(
    (e) => {
      e.preventDefault();
      const newWidth =
        (anchor === 'left'
          ? e.clientX - drawerRef.current.getBoundingClientRect().left
          : window.innerWidth - (e.clientX - drawerRef.current.getBoundingClientRect().left)) + 5;
      onWidthChange(newWidth);
    },
    [anchor, onWidthChange]
  );

  const handleMouseDown = () => {
    setResizeActive(true);
    const handleMouseUp = () => {
      setResizeActive(false);
      document.removeEventListener('mouseup', handleMouseUp, true);
      document.removeEventListener('mousemove', handleMouseMove, true);
    };
    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('mousemove', handleMouseMove, true);
  };

  return (
    <Drawer
      open={open}
      ref={drawerRef}
      anchor={anchor}
      variant="persistent"
      className={clsx(classes.root, className)}
      classes={{ ...drawerClasses, paper: clsx(classes.drawerPaper, drawerPaper) }}
      PaperProps={{ ...PaperProps, style: { width } }}
      {...rest}
    >
      <div
        onMouseDown={handleMouseDown}
        className={clsx(
          classes.resizeHandle,
          resizeActive && classes.resizeHandleActive,
          anchor === 'left' ? classes.resizeHandleRight : classes.resizeHandleLeft
        )}
      />
      <section className={clsx(classes.drawerBody, drawerBody)}>{children}</section>
    </Drawer>
  );
}
