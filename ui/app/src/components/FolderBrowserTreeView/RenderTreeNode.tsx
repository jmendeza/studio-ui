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

import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Typography } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import TreeItem from '@material-ui/lab/TreeItem';
import clsx from 'clsx';
import { useTreeNodeStyles } from './styles';
import { TreeNode } from './FolderBrowserTreeViewUI';

export interface RenderTreeNodeProps {
  node: TreeNode;
  classes?: Partial<Record<'treeItemLabel', string>>;
  onIconClick?(event: React.ChangeEvent<{}>, node: TreeNode): void;
  onLabelClick?(event: React.ChangeEvent<{}>, node: TreeNode): void;
}

export function RenderTreeNode(props: RenderTreeNodeProps) {
  const { node, onIconClick, onLabelClick } = props;
  const classes = useTreeNodeStyles();
  return node.id === 'loading' ? (
    <div className={classes.loading}>
      <CircularProgress size={16} />
      <Typography>
        <FormattedMessage id="words.loading" defaultMessage="Loading" />
      </Typography>
    </div>
  ) : (
    <TreeItem
      key={node.id}
      nodeId={node.id}
      label={node.name}
      classes={{
        root: classes.treeItemRoot,
        content: classes.treeItemContent,
        selected: classes.treeItemSelected,
        label: clsx(classes.treeItemLabel, props.classes?.treeItemLabel)
      }}
      onIconClick={(e) => onIconClick?.(e, node)}
      onLabelClick={(e) => onLabelClick?.(e, node)}
    >
      {Array.isArray(node.children)
        ? node.children.map((childNode) => (
            <RenderTreeNode
              classes={{ treeItemLabel: props.classes?.treeItemLabel }}
              key={childNode.id}
              node={childNode}
              onIconClick={onIconClick}
              onLabelClick={onLabelClick}
            />
          ))
        : null}
    </TreeItem>
  );
}