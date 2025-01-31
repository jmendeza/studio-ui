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

const useStyles = makeStyles()((theme) => ({
  searchBar: {
    width: '100%',
    marginLeft: '20px'
  },
  listHeader: {
    display: 'flex',
    padding: '15px 16px',
    alignItems: 'center',
    borderBottom: `1px solid ${theme.palette.divider}`
  },
  listPaper: {
    flexBasis: '50%'
  },
  list: {
    height: '310px',
    overflow: 'auto'
  }
}));

export default useStyles;
