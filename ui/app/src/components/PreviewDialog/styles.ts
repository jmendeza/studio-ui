/*
 * Copyright (C) 2007-2022 Crafter Software Corporation. All Rights Reserved.
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

import { makeStyles } from 'tss-react/mui';

export const useStyles = makeStyles()((theme) => ({
  container: {
    height: '100%',
    display: 'flex',
    maxWidth: '100%',
    minWidth: '500px',
    minHeight: '60vh',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    '& img': {
      maxWidth: '100%'
    }
  },
  editor: {
    position: 'absolute',
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.grey['300'],
    '& .ace_gutter': {
      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : null
    }
  }
}));