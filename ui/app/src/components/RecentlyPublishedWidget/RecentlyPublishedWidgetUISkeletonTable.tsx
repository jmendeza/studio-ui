/*
 * Copyright (C) 2007-2021 Crafter Software Corporation. All Rights Reserved.
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

import React, { Fragment } from 'react';
import TableContainer from '@material-ui/core/TableContainer';
import useStyles from './styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import { FormattedMessage } from 'react-intl';
import TableBody from '@material-ui/core/TableBody';
import Collapse from '@material-ui/core/Collapse';
import Box from '@material-ui/core/Box';
import GlobalAppGridRow from '../GlobalAppGridRow';
import GlobalAppGridCell from '../GlobalAppGridCell';
import Skeleton from '@material-ui/lab/Skeleton';
import LookupTable from '../../models/LookupTable';
import { rand } from '../PathNavigator/utils';
import Typography from '@material-ui/core/Typography';
import { DashboardItem } from './RecentlyPublishedWidget';

export interface RecentlyPublishedWidgetUiSkeletonTableProps {
  numOfItems?: number;
  items?: DashboardItem[];
  expandedLookup?: LookupTable<boolean>;
}

export default function RecentlyPublishedWidgetUiSkeletonTable(props: RecentlyPublishedWidgetUiSkeletonTableProps) {
  const classes = useStyles();
  const { numOfItems = 2 } = props;

  const items = props.items
    ? props.items
    : new Array(numOfItems).fill(null).map((x, i) => ({
        label: i.toString(),
        children: []
      }));
  const expandedLookup = props.expandedLookup ?? {};

  console.log(items);

  return (
    <TableContainer>
      <Table size="small" className={classes.tableRoot}>
        <TableHead>
          <GlobalAppGridRow className="hoverDisabled">
            <GlobalAppGridCell className="checkbox bordered width5">
              <Skeleton variant="circle" width={30} height={30} className={classes.skeletonCheckbox} />
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width40">
              <Typography variant="subtitle2">
                <FormattedMessage id="words.item" defaultMessage="Item" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width20">
              <Typography variant="subtitle2">
                <FormattedMessage id="recentlyPublished.publishedTo" defaultMessage="Published To" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width20">
              <Typography variant="subtitle2">
                <FormattedMessage id="recentlyPublished.publishDate" defaultMessage="Publish Date" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width10">
              <Typography variant="subtitle2">
                <FormattedMessage id="recentlyPublished.publishedBy" defaultMessage="Published By" />
              </Typography>
            </GlobalAppGridCell>
            <GlobalAppGridCell className="bordered width5" />
          </GlobalAppGridRow>
        </TableHead>
        <TableBody>
          {items.map((item, i) => (
            <Fragment key={i}>
              <GlobalAppGridRow>
                <GlobalAppGridCell colSpan={6} className="expandableCell">
                  <Box display="flex" className={classes.expandableCellBox}>
                    <Skeleton variant="circle" width={30} height={30} className={classes.skeletonCheckbox} />
                    <Skeleton variant="text" width="100%" />
                  </Box>
                </GlobalAppGridCell>
              </GlobalAppGridRow>
              <GlobalAppGridRow className="hoverDisabled">
                <GlobalAppGridCell colSpan={6} className="padded0">
                  <Collapse in={expandedLookup[item.label]}>
                    <Table size="small" className={classes.tableRoot}>
                      <TableBody>
                        {item.children.map((item, i) => (
                          <GlobalAppGridRow key={i}>
                            <GlobalAppGridCell className="checkbox">
                              <Skeleton variant="circle" width={30} height={30} className={classes.skeletonCheckbox} />
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="ellipsis width40 padded0">
                              <Skeleton variant="text" width={`${rand(70, 90)}%`} />
                              <Skeleton variant="text" width={`${rand(70, 90)}%`} />
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="width20">
                              <Skeleton variant="text" width="50px" />
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="width20">
                              <Skeleton variant="text" width={`${rand(50, 60)}%`} />
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="width10">
                              <Skeleton variant="text" width={`${rand(50, 60)}%`} />
                            </GlobalAppGridCell>
                            <GlobalAppGridCell className="width5">
                              <Skeleton variant="circle" width={30} height={30} className={classes.skeletonCheckbox} />
                            </GlobalAppGridCell>
                          </GlobalAppGridRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Collapse>
                </GlobalAppGridCell>
              </GlobalAppGridRow>
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
