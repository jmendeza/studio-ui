/*
 * Copyright (C) 2007-2019 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import ToolPanel from './ToolPanel';
import { useEntitySelectionResource } from "../../../utils/hooks";
import { ElasticParams, MediaItem } from "../../../models/Search";
import { setRequestForgeryToken } from "../../../utils/auth";
import { createStyles } from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import SearchBar from '../../../components/SearchBar';
import { useDispatch, useSelector } from "react-redux";
import GlobalState, { PagedEntityState } from "../../../models/GlobalState";
import TablePagination from "@material-ui/core/TablePagination";
import { Subject } from "rxjs";
import LoadingState from "../../../components/SystemStatus/LoadingState";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { getHostToGuestBus } from "../previewContext";
import { ASSET_DRAG_ENDED, ASSET_DRAG_STARTED, fetchPanelAssetsItems } from "../../../state/actions/preview";
import { ErrorBoundary } from "../../../components/ErrorBoundary";
import MediaCard from '../../../components/MediaCard';
import DragIndicatorRounded from '@material-ui/icons/DragIndicatorRounded';
import EmptyState from "../../../components/SystemStatus/EmptyState";

const translations = defineMessages({
  assetsPanel: {
    id: 'craftercms.ice.assets.title',
    defaultMessage: 'Assets'
  },
  itemsPerPage: {
    id: 'search.itemsPerPage',
    defaultMessage: 'Items per page:'
  },
  noResults: {
    id: 'search.noResults',
    defaultMessage: ' No results found.'
  },
  retrieveAssets: {
    id: 'search.retrieveAssets',
    defaultMessage: 'Retrieving Site Assets'
  }
});

const initialSearchParameters: ElasticParams = {
  keywords: '',
  offset: 0,
  limit: 10,
  filters: {
    'mime-type': ['image/png', 'image/jpeg', 'image/gif', 'video/mp4', 'image/svg+xml']
  }
};

const assetsPanelStyles = makeStyles(() => createStyles({
  assetsPanelWrapper: {
    padding: '15px 15px 55px 15px'
  },
  search: {
    marginBottom: '16px',
  },
  card: {
    cursor: 'move',
    marginBottom: '16px',
  },
  pagination: {
    marginLeft: 'auto',
    position: 'fixed',
    bottom: 0,
    background: 'white',
    color: 'black',
    width: '239px',
    left: 0,
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
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
  toolbar: {
    padding: 0,
    display: 'flex',
    justifyContent: 'space-between',
    paddingLeft: '20px',
    '& .MuiTablePagination-spacer': {
      display: 'none'
    },
    '& .MuiTablePagination-spacer + p': {
      display: 'none'
    }
  },
  noResultsImage: {
    width: '150px'
  },
  noResultsTitle: {
    fontSize: 'inherit',
    marginTop: '10px'
  }
}));

export default function AssetsPanel() {
  const classes = assetsPanelStyles({});
  const [searchParameters, setSearchParameters] = useState(initialSearchParameters);
  const onSearch$ = useMemo(() => new Subject<string>(), []);
  const hostToGuest$ = getHostToGuestBus();

  setRequestForgeryToken();

  const resource = useEntitySelectionResource(state => state.preview.assets, state => state);

  const onDragStart = (mediaItem: MediaItem) => hostToGuest$.next({
    type: ASSET_DRAG_STARTED,
    payload: mediaItem
  });

  const onDragEnd = () => hostToGuest$.next({
    type: ASSET_DRAG_ENDED
  });

  useEffect(() => {
    const subscription = onSearch$.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe((keywords: string) => {
      setSearchParameters({ ...searchParameters, keywords })
    });
    return () => subscription.unsubscribe();
  }, [onSearch$]);

  function handleChangePage(event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage: number) {
    setSearchParameters({ ...searchParameters, offset: newPage * searchParameters.limit })
  }

  function handleSearchKeyword(keyword: string) {
    onSearch$.next(keyword);
  }

  return (
    <ToolPanel title={translations.assetsPanel}>
      <ErrorBoundary>
        <React.Suspense
          fallback={
            <LoadingState
              title="Retrieving Page Model"
              graphicProps={{ width: 150 }}
            />
          }
        >
          <AssetsPanelUI
            classes={classes}
            assetsResource={resource}
            handleChangePage={handleChangePage}
            handleSearchKeyword={handleSearchKeyword}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            searchParameters={searchParameters}
          />
        </React.Suspense>
      </ErrorBoundary>
    </ToolPanel>
  );
}


export function AssetsPanelUI(props) {
  const {
    classes,
    assetsResource,
    handleChangePage,
    handleSearchKeyword,
    onDragStart,
    onDragEnd,
    searchParameters,
  } = props;
  const assets: PagedEntityState<MediaItem> = assetsResource.read();
  const { GUEST_BASE } = useSelector<GlobalState, GlobalState['env']>(state => state.env);
  const { byId, count: total, query, page } = assets;
  const pageNumber = query.offset / query.limit;
  const items = page[pageNumber];
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPanelAssetsItems(searchParameters));
  }, [searchParameters]);

  return (
    <div className={classes.assetsPanelWrapper}>
      <SearchBar
        onChange={handleSearchKeyword}
        classes={{ root: classes.search }}
      />
      <TablePagination
        className={classes.pagination}
        classes={{ root: classes.pagination, selectRoot: 'hidden', toolbar: classes.toolbar }}
        component="div"
        labelRowsPerPage=""
        count={total}
        rowsPerPage={query.limit}
        page={pageNumber}
        backIconButtonProps={{
          'aria-label': 'previous page',
        }}
        nextIconButtonProps={{
          'aria-label': 'next page',
        }}
        onChangePage={handleChangePage}
      />
      {
        items.map((id: string) => {
            let item = byId[id];
            return (
              <MediaCard
                key={item.path}
                item={item}
                previewAppBaseUri={GUEST_BASE}
                hasCheckbox={false}
                hasSubheader={false}
                avatar={DragIndicatorRounded}
                classes={{ root: classes.card }}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            )
          }
        )
      }
      {
        total === 0 &&
        <EmptyState title={formatMessage(translations.noResults)}
                    classes={{ image: classes.noResultsImage, title: classes.noResultsTitle }}/>
      }
    </div>
  )
}
