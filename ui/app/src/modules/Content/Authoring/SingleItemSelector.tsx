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

import React, { useCallback, useReducer, useRef } from 'react';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Variant } from '@material-ui/core/styles/createTypography';
import { DetailedItem } from '../../../models/Item';
import InsertDriveFileRoundedIcon from '@material-ui/icons/InsertDriveFileRounded';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import Popover from '@material-ui/core/Popover';
import Paper from '@material-ui/core/Paper';
import StandardAction from '../../../models/StandardAction';
import PaginationOptions from '../../../models/PaginationOptions';
import { LookupTable } from '../../../models/LookupTable';
import ApiResponse from '../../../models/ApiResponse';
import { createAction } from '@reduxjs/toolkit';
import { GetChildrenResponse } from '../../../models/GetChildrenResponse';
import { useActiveSiteId, useLogicResource } from '../../../utils/hooks';
import { SuspenseWithEmptyState } from '../../../components/SystemStatus/Suspencified';
import Breadcrumbs from '../../../components/Navigation/PathNavigator/PathNavigatorBreadcrumbs';
import PathNavigatorList from '../../../components/Navigation/PathNavigator/PathNavigatorList';
import { getChildrenByPath } from '../../../services/content';
import { getIndividualPaths, withIndex, withoutIndex } from '../../../utils/path';
import { createLookupTable, nou } from '../../../utils/object';
import { forkJoin, Observable } from 'rxjs';
import palette from '../../../styles/palette';
import { isFolder } from '../../../components/Navigation/PathNavigator/utils';
import TablePagination from '@material-ui/core/TablePagination';
import { translations } from '../../../components/Navigation/PathNavigator/translations';
import { useIntl } from 'react-intl';

const useStyles = makeStyles((theme) => ({
  popoverRoot: {
    minWidth: '200px',
    maxWidth: '400px',
    marginTop: '5px',
    padding: '0 5px 5px 5px'
  },
  root: {
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    paddingLeft: '15px',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 'auto',
    maxWidth: '100%',
    minWidth: '200px',
    '& $itemName': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    '&.disable': {
      'min-width': 'auto',
      backgroundColor: 'inherit'
    }
  },
  selectedItem: {
    marginLeft: 'auto',
    display: 'flex',
    minWidth: 0
  },
  title: {
    fontWeight: 600,
    marginRight: '30px'
  },
  changeBtn: {},
  itemName: {},
  itemIcon: {
    fill: palette.teal.main,
    marginRight: 10
  },
  selectIcon: {},
  // region Pagination
  pagination: {
    '& p': {
      padding: 0
    },
    '& svg': {
      top: 'inherit'
    },
    '& .hidden': {
      display: 'none'
    }
  },
  paginationToolbar: {
    padding: '0 0 0 12px',
    minHeight: '30px !important',
    justifyContent: 'space-between',
    '& .MuiTablePagination-spacer': {
      display: 'none'
    },
    '& .MuiTablePagination-spacer + p': {
      display: 'none'
    },
    '& .MuiButtonBase-root': {
      padding: 0
    }
  }
  // endregion
}));

interface SingleItemSelectorProps {
  itemIcon?: React.ElementType;
  selectIcon?: React.ElementType;
  classes?: {
    root?: string;
    title?: string;
    selectIcon?: string;
    itemIcon?: string;
    popoverRoot?: string;
  };
  selectedItem?: DetailedItem;
  rootPath: string;
  label?: string;
  titleVariant?: Variant;
  labelVariant?: Variant;
  open: boolean;
  hideUI?: boolean;
  disabled?: boolean;
  onClose?(): void;
  onItemClicked(item: DetailedItem): void;
  onDropdownClick?(): void;
}

interface SingleItemSelectorState extends PaginationOptions {
  byId: LookupTable<DetailedItem>;
  isFetching: boolean;
  error: ApiResponse;
  items: string[];
  leaves: string[];
  rootPath: string;
  currentPath: string;
  keywords: string;
  pageNumber: number;
  offset: number;
  total: number;
  limit: number;
  breadcrumb: string[];
}

const init: (props: SingleItemSelectorProps) => SingleItemSelectorState = (props: SingleItemSelectorProps) => ({
  byId: null,
  isFetching: null,
  error: null,
  items: [],
  leaves: [],
  keywords: '',
  pageNumber: 0,
  breadcrumb: [],
  offset: 0,
  limit: 10,
  total: 0,
  rootPath: props.rootPath,
  currentPath: props.selectedItem?.path ?? props.rootPath
});

type SingleItemSelectorReducer = React.Reducer<SingleItemSelectorState, StandardAction>;

const reducer: SingleItemSelectorReducer = (state, { type, payload }) => {
  switch (type) {
    case changeCurrentPath.type: {
      return {
        ...state,
        currentPath: payload.path
      };
    }
    case setKeyword.type: {
      return {
        ...state,
        keywords: payload,
        isFetching: true
      };
    }
    case changePage.type: {
      return { ...state, isFetching: true };
    }
    case fetchParentsItems.type:
    case fetchChildrenByPath.type: {
      return {
        ...state,
        currentPath: payload,
        isFetching: true
      };
    }
    case fetchChildrenByPathComplete.type: {
      const { currentPath, rootPath, leaves, byId } = state;
      if (payload.length === 0 && withoutIndex(currentPath) !== withoutIndex(rootPath)) {
        return {
          ...state,
          currentPath: getNextPath(currentPath, byId),
          leaves: leaves.concat(currentPath),
          total: payload.total,
          isFetching: false
        };
      } else {
        const nextItems = {
          ...{ ...state.byId, ...createLookupTable(payload, 'path') },
          [payload.parent.path]: payload.parent
        };

        return {
          ...state,
          byId: nextItems,
          items: payload.map((item) => item.path),
          isFetching: false,
          total: payload.total,
          offset: payload.offset,
          limit: payload.limit,
          breadcrumb: getIndividualPaths(withoutIndex(currentPath), withoutIndex(rootPath))
        };
      }
    }
    case fetchParentsItemsComplete.type: {
      const { currentPath, rootPath, byId } = state;
      let nextItems: any = { ...byId };
      let items = [];
      let total;
      let offset;
      let limit;

      payload.forEach((response: GetChildrenResponse, i: number) => {
        if (i === payload.length - 1) {
          items = response.map((item) => item.path);
          total = response.total;
          offset = response.offset;
          limit = response.limit;
        }
        nextItems = {
          ...nextItems,
          ...createLookupTable(response, 'path'),
          [response.parent.path]: response.parent
        };
      });

      return {
        ...state,
        byId: nextItems,
        items: items,
        isFetching: false,
        limit,
        total,
        offset,
        breadcrumb: getIndividualPaths(withoutIndex(currentPath), withoutIndex(rootPath))
      };
    }
    default:
      throw new Error(`Unknown action "${type}"`);
  }
};

function getNextPath(currentPath: string, byId: LookupTable<DetailedItem>): string {
  let pieces = currentPath.split('/').slice(0);
  pieces.pop();
  if (currentPath.includes('index.xml')) {
    pieces.pop();
  }
  let nextPath = pieces.join('/');
  if (nou(byId[nextPath])) {
    nextPath = withIndex(nextPath);
  }
  return nextPath;
}

export const changeCurrentPath = createAction<DetailedItem>('CHANGE_SELECTED_ITEM');

export const setKeyword = createAction<string>('SET_KEYWORD');

export const changePage = createAction<number>('CHANGE_PAGE');

export const fetchChildrenByPath = createAction<string>('FETCH_CHILDREN_BY_PATH');

export const fetchParentsItems = createAction<string>('FETCH_PARENTS_ITEMS');

export const fetchParentsItemsComplete = createAction<GetChildrenResponse[]>('FETCH_PARENTS_ITEMS_COMPLETE');

export const fetchChildrenByPathComplete = createAction<GetChildrenResponse>('FETCH_CHILDREN_BY_PATH_COMPLETE');

export const fetchChildrenByPathFailed = createAction<any>('FETCH_CHILDREN_BY_PATH_FAILED');

export default function SingleItemSelector(props: SingleItemSelectorProps) {
  const {
    itemIcon: ItemIcon = InsertDriveFileRoundedIcon,
    selectIcon: SelectIcon = ExpandMoreRoundedIcon,
    classes: propClasses,
    titleVariant = 'body1',
    labelVariant = 'body1',
    hideUI = false,
    disabled = false,
    onItemClicked,
    onDropdownClick,
    onClose,
    label,
    open,
    selectedItem,
    rootPath
  } = props;
  const classes = useStyles();
  const anchorEl = useRef();
  const [state, _dispatch] = useReducer(reducer, props, init);
  const { formatMessage } = useIntl();
  const site = useActiveSiteId();

  const exec = useCallback(
    (action) => {
      _dispatch(action);
      const { type, payload } = action;
      switch (type) {
        case setKeyword.type: {
          getChildrenByPath(site, state.currentPath, { limit: state.limit, keyword: payload }).subscribe(
            (response) => exec(fetchChildrenByPathComplete(response)),
            (response) => exec(fetchChildrenByPathFailed(response))
          );
          break;
        }
        case changePage.type: {
          getChildrenByPath(site, state.currentPath, { limit: state.limit, offset: payload }).subscribe(
            (response) => exec(fetchChildrenByPathComplete(response)),
            (response) => exec(fetchChildrenByPathFailed(response))
          );
          break;
        }
        case fetchChildrenByPath.type:
          getChildrenByPath(site, payload, { limit: state.limit }).subscribe(
            (response) => exec(fetchChildrenByPathComplete(response)),
            (response) => exec(fetchChildrenByPathFailed(response))
          );
          break;
        case fetchParentsItems.type:
          const parentsPath = getIndividualPaths(payload, state.rootPath);
          const requests: Observable<GetChildrenResponse>[] = [];

          if (parentsPath.length) {
            parentsPath.forEach((parentPath) => {
              if (!state.items[parentPath] && !state.items[withIndex(parentPath)]) {
                requests.push(getChildrenByPath(site, parentPath, { limit: state.limit }));
              }
            });
            forkJoin(requests).subscribe(
              (response) => exec(fetchParentsItemsComplete(response)),
              (response) => exec(fetchChildrenByPathFailed(response))
            );
          } else {
            getChildrenByPath(site, payload, { limit: state.limit }).subscribe(
              (response) => exec(fetchChildrenByPathComplete(response)),
              (response) => exec(fetchChildrenByPathFailed(response))
            );
          }
          break;
      }
    },
    [state, site]
  );

  const itemsResource = useLogicResource<DetailedItem[], SingleItemSelectorState>(state, {
    shouldResolve: (consumer) => Boolean(consumer.byId) && !consumer.isFetching,
    shouldReject: (consumer) => Boolean(consumer.error),
    shouldRenew: (consumer, resource) => consumer.isFetching && resource.complete,
    resultSelector: (consumer) => consumer.items.map((id) => consumer.byId[id]),
    errorSelector: (consumer) => consumer.error
  });

  const handleDropdownClick = (item: DetailedItem) => {
    onDropdownClick();
    exec(fetchParentsItems(item?.path ?? rootPath));
  };

  const onPathSelected = (item: DetailedItem) => {
    exec(fetchChildrenByPath(item.path));
  };

  const onSearch = (keyword) => {
    exec(setKeyword(keyword));
  };

  const onCrumbSelected = (item: DetailedItem) => {
    if (state.breadcrumb.length === 1) {
      handleItemClicked(item);
    } else {
      exec(fetchChildrenByPath(item.path));
    }
  };

  const handleItemClicked = (item: DetailedItem) => {
    const folder = isFolder(item);

    if (folder) {
      onPathSelected(item);
    } else {
      exec(changeCurrentPath(item));
      onItemClicked(item);
    }
  };

  const onPageChanged = (page: number) => {
    const offset = page * state.limit;
    exec(changePage(offset));
  };

  const Wrapper = hideUI ? React.Fragment : Paper;
  const wrapperProps = hideUI
    ? {}
    : {
        className: clsx(classes.root, !onDropdownClick && 'disable', propClasses?.root),
        elevation: 0
      };

  return (
    <Wrapper {...wrapperProps}>
      {!hideUI && (
        <>
          <Typography variant={titleVariant} className={clsx(classes.title, propClasses?.title)}>
            {label}
          </Typography>
          {selectedItem && (
            <div className={classes.selectedItem}>
              <ItemIcon className={clsx(classes.itemIcon, propClasses?.itemIcon)} />
              <Typography className={classes.itemName} variant={labelVariant}>
                {selectedItem.label}
              </Typography>
            </div>
          )}
        </>
      )}
      {onDropdownClick && (
        <IconButton
          className={classes.changeBtn}
          ref={anchorEl}
          disabled={disabled}
          onClick={disabled ? null : () => handleDropdownClick(selectedItem)}
        >
          <SelectIcon className={clsx(classes.selectIcon, propClasses?.selectIcon)} />
        </IconButton>
      )}
      <Popover
        anchorEl={anchorEl.current}
        open={open}
        classes={{ paper: clsx(classes.popoverRoot, propClasses?.popoverRoot) }}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <Breadcrumbs
          keyword={state?.keywords}
          breadcrumb={state.breadcrumb.map((path) => state.byId[path] ?? state.byId[withIndex(path)])}
          onSearch={onSearch}
          onCrumbSelected={onCrumbSelected}
        />
        <SuspenseWithEmptyState resource={itemsResource}>
          <PathNavigatorList
            leaves={state?.leaves ?? []}
            locale={'en_US'}
            resource={itemsResource}
            onPathSelected={onPathSelected}
            onItemClicked={handleItemClicked}
          />
          <TablePagination
            classes={{
              root: classes.pagination,
              selectRoot: 'hidden',
              toolbar: classes.paginationToolbar
            }}
            component="div"
            labelRowsPerPage=""
            count={state.total}
            rowsPerPage={state.limit}
            page={state && Math.ceil(state.offset / state.limit)}
            backIconButtonProps={{ 'aria-label': formatMessage(translations.previousPage) }}
            nextIconButtonProps={{ 'aria-label': formatMessage(translations.nextPage) }}
            onChangePage={(e, page: number) => onPageChanged(page)}
          />
        </SuspenseWithEmptyState>
      </Popover>
    </Wrapper>
  );
}
