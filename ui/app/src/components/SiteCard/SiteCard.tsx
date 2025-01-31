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

import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { Site } from '../../models/Site';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import Tooltip from '@mui/material/Tooltip';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import CardActionArea from '@mui/material/CardActionArea';
import { Typography } from '@mui/material';
import ConfirmDropdown from '../ConfirmDropdown';
import { useSiteCardStyles } from '../SitesGrid/styles';
import { PublishingStatus } from '../../models/Publishing';
import { PublishingStatusButtonUI } from '../PublishingStatusButton';

interface SiteCardProps {
  site: Site;
  onSiteClick(site: Site): void;
  onDeleteSiteClick(site: Site): void;
  onEditSiteClick(site: Site): void;
  onPublishButtonClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, site: Site): void;
  fallbackImageSrc?: string;
  compact?: boolean;
  publishingStatus: PublishingStatus | false;
}

const translations = defineMessages({
  confirmHelperText: {
    id: 'siteCard.helperText',
    defaultMessage: 'Delete "{site}" project?'
  },
  confirmOk: {
    id: 'words.yes',
    defaultMessage: 'Yes'
  },
  confirmCancel: {
    id: 'words.no',
    defaultMessage: 'No'
  }
});

export function SiteCard(props: SiteCardProps) {
  const {
    site,
    onSiteClick,
    onDeleteSiteClick,
    onEditSiteClick,
    fallbackImageSrc = '/studio/static-assets/themes/cstudioTheme/images/default-contentType.jpg',
    compact = false,
    publishingStatus,
    onPublishButtonClick
  } = props;
  const { classes, cx: clsx } = useSiteCardStyles();
  const { formatMessage } = useIntl();

  return (
    <Card className={clsx(classes.card, compact && 'compact')}>
      <CardActionArea onClick={() => onSiteClick(site)} component="div">
        <CardHeader
          title={site.name}
          className={classes.cardHeader}
          subheader={
            site.description && (
              <Tooltip title={site.description}>
                <Typography color="textSecondary" component="h2" variant="subtitle2" className="cardSubtitle">
                  {site.description}
                </Typography>
              </Tooltip>
            )
          }
          onClick={(e) => {
            e.stopPropagation();
            onSiteClick(site);
          }}
          titleTypographyProps={{
            variant: 'subtitle2',
            component: 'h2',
            className: 'cardTitle'
          }}
        />
        {!compact && (
          <CardMedia
            component="img"
            className={classes.media}
            image={site.imageUrl}
            title={site.name}
            onError={(event) => (event.target.src = fallbackImageSrc)}
          />
        )}
      </CardActionArea>
      <CardActions className={classes.cardActions} disableSpacing>
        {publishingStatus !== false && (
          <PublishingStatusButtonUI
            isFetching={!publishingStatus}
            enabled={publishingStatus?.enabled}
            status={publishingStatus?.status}
            totalItems={publishingStatus?.totalItems}
            numberOfItems={publishingStatus?.numberOfItems}
            variant="icon"
            size={compact ? 'small' : 'medium'}
            onClick={(e) => onPublishButtonClick(e, site)}
          />
        )}
        {onEditSiteClick && (
          <Tooltip title={<FormattedMessage id="words.edit" defaultMessage="Edit" />}>
            <IconButton onClick={() => onEditSiteClick(site)} size={compact ? 'small' : 'medium'}>
              <EditRoundedIcon />
            </IconButton>
          </Tooltip>
        )}
        {onDeleteSiteClick && (
          <ConfirmDropdown
            size={compact ? 'small' : 'medium'}
            cancelText={formatMessage(translations.confirmCancel)}
            confirmText={formatMessage(translations.confirmOk)}
            confirmHelperText={formatMessage(translations.confirmHelperText, { site: site.name })}
            iconTooltip={<FormattedMessage id="words.delete" defaultMessage="Delete" />}
            icon={DeleteRoundedIcon}
            onConfirm={() => {
              onDeleteSiteClick(site);
            }}
          />
        )}
      </CardActions>
    </Card>
  );
}

export default SiteCard;
