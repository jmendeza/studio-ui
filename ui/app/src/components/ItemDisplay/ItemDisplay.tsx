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

import * as React from 'react';
import { ElementType, forwardRef } from 'react';
import { DetailedItem, SandboxItem } from '../../models/Item';
import { makeStyles } from 'tss-react/mui';
import { CSSObject as CSSProperties } from 'tss-react';
import palette from '../../styles/palette';
import Typography, { TypographyProps } from '@mui/material/Typography';
import { isPreviewable } from '../PathNavigator/utils';
import ItemStateIcon from '../ItemStateIcon';
import ItemTypeIcon from '../ItemTypeIcon';
import ItemPublishingTargetIcon from '../ItemPublishingTargetIcon';
import { isInWorkflow } from './utils';

export type ItemDisplayClassKey = 'root' | 'label' | 'labelPreviewable' | 'icon' | 'typeIcon';
export type ItemDisplayStyles = Partial<Record<ItemDisplayClassKey, CSSProperties>>;

export interface ItemDisplayProps<LabelTypographyComponent extends React.ElementType = 'span'>
  extends React.HTMLAttributes<HTMLSpanElement> {
  showPublishingTarget?: boolean;
  showWorkflowState?: boolean;
  showItemType?: boolean;
  showNavigableAsLinks?: boolean;
  classes?: Partial<Record<ItemDisplayClassKey, string>>;
  styles?: ItemDisplayStyles;
  item: DetailedItem | SandboxItem;
  labelTypographyProps?: TypographyProps<LabelTypographyComponent, { component?: LabelTypographyComponent }>;
  isNavigableFn?: (item: DetailedItem | SandboxItem) => boolean;
  labelComponent?: ElementType;
}

const useStyles = makeStyles<ItemDisplayStyles, ItemDisplayClassKey>()(
  (theme, { root, label, labelPreviewable, icon, typeIcon } = {} as ItemDisplayStyles) => ({
    root: {
      display: 'inline-flex',
      alignItems: 'center',
      placeContent: 'left center',
      maxWidth: '100%',
      '& .MuiSvgIcon-root': {
        fontSize: '1.1rem'
      },
      ...root
    },
    label: {
      marginLeft: 2,
      display: 'inline-block',
      ...label
    },
    labelPreviewable: {
      color: theme.palette.mode === 'dark' ? palette.teal.tint : palette.teal.shade,
      ...labelPreviewable
    },
    icon: {
      fontSize: '1rem',
      ...icon
    },
    typeIcon: {
      marginRight: 3,
      ...typeIcon
    }
  })
);

const ItemDisplay = forwardRef<HTMLSpanElement, ItemDisplayProps>((props, ref) => {
  const {
    item,
    styles,
    classes: propClasses,
    // @see https://github.com/craftercms/craftercms/issues/5442
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    showPublishingTarget = true,
    showWorkflowState = true,
    showItemType = true,
    showNavigableAsLinks = true,
    isNavigableFn = isPreviewable,
    labelTypographyProps,
    labelComponent = 'span',
    ...rest
  } = props;
  const { classes, cx } = useStyles(props.styles);
  if (!item) {
    // Prevents crashing if the item is nullish
    return null;
  }
  const inWorkflow = isInWorkflow(item.stateMap) || item.systemType === 'folder';
  return (
    <span ref={ref} {...rest} className={cx(classes.root, propClasses?.root, rest?.className)}>
      {/* @see https://github.com/craftercms/craftercms/issues/5442 */}
      {inWorkflow
        ? showWorkflowState && <ItemStateIcon item={item} className={cx(classes.icon, propClasses?.icon)} />
        : showPublishingTarget && (
            <ItemPublishingTargetIcon item={item} className={cx(classes.icon, propClasses?.icon)} />
          )}
      {showItemType && <ItemTypeIcon item={item} className={cx(classes.icon, propClasses?.icon)} />}
      <Typography
        noWrap
        component={labelComponent}
        {...labelTypographyProps}
        className={cx(
          classes.label,
          showNavigableAsLinks && isNavigableFn(item) && classes.labelPreviewable,
          labelTypographyProps?.className
        )}
        title={item.label}
        children={item.label}
      />
    </span>
  );
});

export default ItemDisplay;
