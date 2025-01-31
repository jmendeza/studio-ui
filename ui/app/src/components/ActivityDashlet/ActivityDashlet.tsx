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

import { Activity } from '../../models/Activity';
import React, { useEffect, useMemo } from 'react';
import { MoreVertRounded, RefreshRounded } from '@mui/icons-material';
import { PREVIEW_URL_PATH, UNDEFINED } from '../../utils/constants';
import useActiveSiteId from '../../hooks/useActiveSiteId';
import useEnv from '../../hooks/useEnv';
import useLocale from '../../hooks/useLocale';
import useSpreadState from '../../hooks/useSpreadState';
import { fetchActivity } from '../../services/dashboard';
import IconButton from '@mui/material/IconButton';
import { FormattedMessage, useIntl } from 'react-intl';
import MuiTimeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineConnector from '@mui/lab/TimelineConnector';
import Typography from '@mui/material/Typography';
import { CommonDashletProps } from '../SiteDashboard/utils';
import DropDownMenu from '../DropDownMenuButton/DropDownMenuButton';
import {
  ActivitiesAndAll,
  activityNameLookup,
  renderActivity,
  renderActivityTimestamp,
  useSelectionLookupState
} from './utils';
import { AuthorFilter } from './AuthorFilter';
import Skeleton from '@mui/material/Skeleton';
import { styled } from '@mui/material/styles';
import { RangePickerModal } from './RangePickerModal';
import Tooltip from '@mui/material/Tooltip';
import DashletCard from '../DashletCard/DashletCard';
import { asLocalizedDateTime } from '../../utils/datetime';
import { DashletAvatar, DashletEmptyMessage, PersonAvatar, PersonFullName } from '../DashletCard/dashletCommons';
import { getSystemLink } from '../../utils/system';
import { useDispatch } from 'react-redux';
import { changeCurrentUrl } from '../../state/actions/preview';
import { useWidgetDialogContext } from '../WidgetDialog';
import PackageDetailsDialog from '../PackageDetailsDialog/PackageDetailsDialog';

export interface ActivityDashletProps extends CommonDashletProps {}

interface ActivityDashletState {
  openRangePicker: boolean;
  openPackageDetailsDialog: boolean;
  selectedPackageId: string;
  feed: Activity[];
  usernames: string[];
  feedType: FeedTypes;
  dateFrom: string;
  dateTo: string;
  limit: number;
  offset: number;
  total: number;
  loadingFeed: boolean;
  loadingChunk: boolean;
}

type FeedTypes = 'timeline' | 'range';

const Timeline = styled(MuiTimeline)({ margin: 0, padding: 0 });

const CustomTimelineItem = styled(TimelineItem)({
  minHeight: 0,
  '&.MuiTimelineItem-missingOppositeContent::before': {
    display: 'none',
    content: 'none'
  }
});

const TimelineDotWithAvatar = styled(TimelineDot)({ padding: 0, border: 'none', alignSelf: 'auto' });

const TimelineDotWithoutAvatar = styled(TimelineDot)({ alignSelf: 'auto' });

const SizedTimelineSeparator = styled(TimelineSeparator)({
  width: 40,
  minWidth: 40,
  textAlign: 'center',
  alignItems: 'center',
  alignContent: 'center',
  justifyContent: 'center'
});

const emptyTimelineContentSx = { pt: 0, pb: 0 };

const getSkeletonTimelineItems = ({ items = 1 }: { items?: number }) =>
  new Array(items).fill(null).map((nothing, index) => (
    <CustomTimelineItem key={index}>
      <SizedTimelineSeparator>
        <TimelineConnector />
        <TimelineDotWithAvatar>
          <DashletAvatar />
        </TimelineDotWithAvatar>
        <TimelineConnector />
      </SizedTimelineSeparator>
      <TimelineContent sx={{ py: '12px', px: 2 }}>
        <Typography variant="h6">
          <Skeleton variant="text" />
        </Typography>
        <Typography variant="body1">
          <Skeleton variant="text" />
        </Typography>
        <Typography variant="body1">
          <Skeleton variant="text" />
        </Typography>
      </TimelineContent>
    </CustomTimelineItem>
  ));

export function ActivityDashlet(props: ActivityDashletProps) {
  const { borderLeftColor = 'success.main' } = props;
  const locale = useLocale();
  const site = useActiveSiteId();
  const { authoringBase } = useEnv();
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const widgetDialogContext = useWidgetDialogContext();
  const [
    {
      feed,
      feedType,
      usernames,
      dateFrom,
      dateTo,
      limit,
      offset,
      total,
      openRangePicker,
      loadingChunk,
      loadingFeed,
      selectedPackageId,
      openPackageDetailsDialog
    },
    setState
  ] = useSpreadState<ActivityDashletState>({
    loadingChunk: false,
    loadingFeed: false,
    openRangePicker: false,
    openPackageDetailsDialog: false,
    selectedPackageId: null,
    feed: null,
    usernames: null,
    feedType: 'timeline',
    dateFrom: null,
    dateTo: null,
    limit: 10,
    offset: 0,
    total: null
  });
  const [selectedActivities, setSelectedActivities, activities] = useSelectionLookupState<ActivitiesAndAll>({
    ALL: true
  });
  // region activityFilterOptions = ...
  const activityFilterOptions = useMemo(
    () =>
      Object.keys(activityNameLookup).map((key) => ({
        id: key,
        primaryText: activityNameLookup[key],
        selected: selectedActivities[key]
      })),
    [selectedActivities]
  );
  // endregion
  // region feedTypeOptions
  const feedTypeOptions = useMemo(
    () => [
      {
        id: 'timeline',
        primaryText: <FormattedMessage id="words.timeline" defaultMessage="Timeline" />,
        selected: feedType === 'timeline',
        secondaryText: (
          <FormattedMessage id="activityDashlet.timelineOptionTip" defaultMessage="All activity, most recent first" />
        )
      },
      {
        id: 'range',
        primaryText: <FormattedMessage id="words.range" defaultMessage="Range" />,
        selected: feedType === 'range',
        secondaryText: (
          <FormattedMessage id="activityDashlet.rangeOptionTip" defaultMessage="Specify a range of dates" />
        )
      }
    ],
    [feedType]
  );
  // endregion
  // region onRefresh
  const onRefresh = useMemo(
    () => () => {
      setState({ feed: null, total: null, offset: 0, loadingFeed: true });
      fetchActivity(site, {
        actions: activities.filter((key) => key !== 'ALL'),
        usernames,
        dateTo,
        dateFrom,
        limit
      }).subscribe((feed) => {
        setState({ feed, total: feed.total, loadingFeed: false });
      });
    },
    [site, activities, dateFrom, dateTo, limit, setState, usernames]
  );
  // endregion
  const loadNextPage = () => {
    let newOffset = offset + limit;
    setState({ loadingChunk: true });
    fetchActivity(site, {
      actions: activities.filter((key) => key !== 'ALL'),
      usernames,
      dateTo,
      dateFrom,
      limit,
      offset: newOffset
    }).subscribe((nextFeedChunk) => {
      setState({
        feed: feed.concat(nextFeedChunk),
        total: nextFeedChunk.total,
        offset: newOffset,
        loadingChunk: false
      });
    });
  };
  const onItemClick = (previewUrl, e) => {
    const pathname = window.location.pathname;
    if (pathname.includes(PREVIEW_URL_PATH)) {
      dispatch(changeCurrentUrl(previewUrl));
      widgetDialogContext?.onClose(e, null);
    } else {
      window.location.href = getSystemLink({
        page: previewUrl,
        systemLinkId: 'preview',
        site,
        authoringBase
      });
    }
  };
  const onPackageClick = (pkg) => {
    setState({ openPackageDetailsDialog: true, selectedPackageId: pkg.id });
  };
  const hasMoreItemsToLoad = total > 0 && limit + offset < total;
  useEffect(() => {
    onRefresh();
  }, [onRefresh, setState]);
  return (
    <DashletCard
      {...props}
      borderLeftColor={borderLeftColor}
      title={<FormattedMessage id="words.activity" defaultMessage="Activity" />}
      headerAction={
        <IconButton onClick={onRefresh}>
          <RefreshRounded />
        </IconButton>
      }
      actionsBar={
        <>
          <DropDownMenu
            size="small"
            variant="text"
            onMenuItemClick={(e, id: ActivitiesAndAll) => setSelectedActivities(id)}
            options={activityFilterOptions}
            closeOnSelection={false}
            menuProps={{ sx: { minWidth: 180 } }}
            listItemProps={{ dense: true }}
          >
            {selectedActivities.ALL ? (
              <FormattedMessage id="activityDashlet.showActivityByEveryone" defaultMessage="All activities" />
            ) : (
              <FormattedMessage
                id="activityDashlet.showSelectedActivities"
                defaultMessage="Selected activities ({count})"
                values={{ count: activities.length }}
              />
            )}
          </DropDownMenu>
          <AuthorFilter onChange={(users) => setState({ usernames: users.map(({ username }) => username) })} />
          <DropDownMenu
            size="small"
            variant="text"
            onMenuItemClick={(e, feedType: FeedTypes) => {
              const state = { feedType, dateTo, dateFrom, openRangePicker: feedType === 'range' };
              if (feedType === 'timeline') {
                state.dateTo = null;
                state.dateFrom = null;
              }
              setState(state);
            }}
            options={feedTypeOptions}
            menuProps={{ sx: { minWidth: 200 } }}
            listItemProps={{ dense: true }}
            onClick={() => {
              if (feedType === 'range') {
                setState({ openRangePicker: true });
                return false;
              }
            }}
          >
            <FormattedMessage id="words.timeline" defaultMessage="Timeline" />
          </DropDownMenu>
        </>
      }
    >
      {loadingFeed && (
        <Timeline position="right">
          <CustomTimelineItem>
            <SizedTimelineSeparator>
              <TimelineDotWithoutAvatar />
            </SizedTimelineSeparator>
            <TimelineContent sx={emptyTimelineContentSx} />
          </CustomTimelineItem>
          {getSkeletonTimelineItems({ items: 3 })}
          <CustomTimelineItem>
            <SizedTimelineSeparator>
              {hasMoreItemsToLoad ? (
                <TimelineDotWithAvatar sx={{ bgcolor: 'unset' }}>
                  <Tooltip
                    title={
                      <FormattedMessage
                        id="activityDashlet.loadMore"
                        defaultMessage="Load {limit} more"
                        values={{ limit }}
                      />
                    }
                  >
                    <IconButton color="primary" size="small" onClick={loadNextPage}>
                      <MoreVertRounded />
                    </IconButton>
                  </Tooltip>
                </TimelineDotWithAvatar>
              ) : (
                <TimelineDotWithoutAvatar />
              )}
            </SizedTimelineSeparator>
            <TimelineContent sx={emptyTimelineContentSx} />
          </CustomTimelineItem>
        </Timeline>
      )}
      {Boolean(feed?.length) && (
        <Timeline position="right">
          <CustomTimelineItem>
            <SizedTimelineSeparator>
              <TimelineDotWithoutAvatar />
            </SizedTimelineSeparator>
            <TimelineContent sx={emptyTimelineContentSx} />
          </CustomTimelineItem>
          {feed.map((activity) => (
            <CustomTimelineItem key={activity.id}>
              <SizedTimelineSeparator>
                <TimelineConnector />
                <TimelineDotWithAvatar>
                  <PersonAvatar person={activity.person} />
                </TimelineDotWithAvatar>
                <TimelineConnector />
              </SizedTimelineSeparator>
              <TimelineContent sx={{ py: '12px', px: 2 }}>
                <PersonFullName person={activity.person} />
                <Typography>{renderActivity(activity, { formatMessage, onPackageClick, onItemClick })}</Typography>
                <Typography
                  variant="caption"
                  title={asLocalizedDateTime(activity.actionTimestamp, locale.localeCode, locale.dateTimeFormatOptions)}
                >
                  {renderActivityTimestamp(activity.actionTimestamp, locale)}
                </Typography>
              </TimelineContent>
            </CustomTimelineItem>
          ))}
          {loadingChunk ? (
            getSkeletonTimelineItems({ items: 3 })
          ) : (
            <CustomTimelineItem>
              <SizedTimelineSeparator>
                {hasMoreItemsToLoad ? (
                  <TimelineDotWithAvatar sx={{ bgcolor: 'unset' }}>
                    <Tooltip
                      title={
                        <FormattedMessage
                          id="activityDashlet.loadMore"
                          defaultMessage="Load {limit} more"
                          values={{ limit }}
                        />
                      }
                    >
                      <IconButton color="primary" size="small" onClick={loadNextPage}>
                        <MoreVertRounded />
                      </IconButton>
                    </Tooltip>
                  </TimelineDotWithAvatar>
                ) : (
                  <TimelineDotWithoutAvatar />
                )}
              </SizedTimelineSeparator>
              <TimelineContent
                sx={
                  hasMoreItemsToLoad
                    ? { py: '12px', px: 2, display: 'flex', alignItems: 'center' }
                    : emptyTimelineContentSx
                }
              >
                {hasMoreItemsToLoad && (
                  <Typography variant="body2" color="text.secondary">
                    <FormattedMessage
                      id="activityDashlet.hasMoreItemsToLoadMessage"
                      defaultMessage="{count} more {count, plural, one {activity} other {activities}} available"
                      values={{ count: total - (limit + offset) }}
                    />
                  </Typography>
                )}
              </TimelineContent>
            </CustomTimelineItem>
          )}
        </Timeline>
      )}
      {total === 0 && (
        <DashletEmptyMessage>
          <FormattedMessage id="activityDashlet.noEntriesFound" defaultMessage="No activity was found." />
        </DashletEmptyMessage>
      )}
      <RangePickerModal
        open={openRangePicker}
        onClose={() => setState({ openRangePicker: false })}
        onAccept={(dateFrom, dateTo) =>
          setState({ dateFrom: dateFrom.toISOString(), dateTo: dateTo.toISOString(), openRangePicker: false })
        }
        onSwitchToTimelineClick={
          feedType === 'range'
            ? () => {
                setState({ feedType: 'timeline', dateTo: null, dateFrom: null, openRangePicker: false });
              }
            : UNDEFINED
        }
      />
      <PackageDetailsDialog
        open={openPackageDetailsDialog}
        onClose={() => setState({ openPackageDetailsDialog: false })}
        onClosed={() => setState({ selectedPackageId: null })}
        packageId={selectedPackageId}
      />
    </DashletCard>
  );
}

export default ActivityDashlet;
