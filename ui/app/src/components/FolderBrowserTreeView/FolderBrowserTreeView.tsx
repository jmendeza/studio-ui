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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getIndividualPaths } from '../../utils/path';
import FolderBrowserTreeViewUI, { FolderBrowserTreeViewNode } from './FolderBrowserTreeViewUI';
import LookupTable from '../../models/LookupTable';
import { ApiResponse } from '../../models/ApiResponse';
import { forkJoin, Observable } from 'rxjs';
import { useActiveSiteId } from '../../hooks/useActiveSiteId';
import { useLogicResource } from '../../hooks/useLogicResource';
import Suspencified from '../Suspencified/Suspencified';
import FolderBrowserTreeViewSkeleton from './FolderBrowserTreeViewSkeleton';
import { LegacyItem } from '../../models/Item';
import { fetchLegacyItemsTree } from '../../services/content';
import { legacyItemsToTreeNodes } from './utils';

export interface FolderBrowserTreeViewProps {
  rootPath: string;
  initialPath?: string;
  showPathTextBox?: boolean;
  classes?: Partial<Record<'root' | 'treeViewRoot' | 'treeItemLabel', string>>;
  onPathSelected?(path: string): void;
}

export function FolderBrowserTreeView(props: FolderBrowserTreeViewProps) {
  const site = useActiveSiteId();
  const { rootPath, initialPath, showPathTextBox = true, classes, onPathSelected } = props;
  const [currentPath, setCurrentPath] = useState(initialPath ?? rootPath);
  const [expanded, setExpanded] = useState(initialPath ? getIndividualPaths(initialPath) : [rootPath]);
  const [treeNodes, setTreeNodes] = useState<FolderBrowserTreeViewNode>(null);
  const nodesLookupRef = useRef<LookupTable<FolderBrowserTreeViewNode>>({});
  const [error, setError] = useState<Partial<ApiResponse>>(null);

  useEffect(() => {
    if (currentPath) {
      let nodesLookup = nodesLookupRef.current;
      if (!nodesLookup[currentPath] || !nodesLookup[currentPath]?.fetched) {
        const allPaths = getIndividualPaths(currentPath, rootPath).filter(
          (path) => !nodesLookup[path] || !nodesLookup[path].fetched
        );
        const requests: Observable<LegacyItem>[] = [];
        allPaths.forEach((nextPath) => {
          requests.push(fetchLegacyItemsTree(site, nextPath, { depth: 1, order: 'default' }));
        });

        if (requests.length) {
          forkJoin(requests).subscribe(
            (responses) => {
              let rootNode;
              responses.forEach((item, i) => {
                let parent;

                if (item.deleted) {
                  return;
                }

                if (!nodesLookup['root']) {
                  parent = {
                    id: item.path,
                    name: item.name ? item.name : 'root',
                    fetched: true,
                    children: legacyItemsToTreeNodes(item.children)
                  };
                  rootNode = parent;
                  nodesLookup[item.path] = parent;
                  nodesLookup['root'] = parent;
                } else {
                  rootNode = nodesLookup['root'];
                  parent = nodesLookup[item.path];
                  parent.fetched = true;
                  parent.children = legacyItemsToTreeNodes(item.children);
                }

                parent.children.forEach((child) => {
                  nodesLookup[child.id] = child;
                });
              });
              rootNode && setTreeNodes({ ...rootNode });
            },
            (response) => {
              setError(response);
            }
          );
        }
      }
    }
  }, [currentPath, rootPath, site]);

  const onIconClick = (event: React.ChangeEvent<{}>, node: FolderBrowserTreeViewNode) => {
    event.preventDefault();
    setCurrentPath(node.id);
    onPathSelected(node.id);
    let nextExpanded = expanded.includes(node.id) ? expanded.filter((id) => id !== node.id) : [...expanded, node.id];
    setExpanded(nextExpanded);
  };

  const onLabelClick = (event: React.ChangeEvent<{}>, node: FolderBrowserTreeViewNode) => {
    event.preventDefault();
    setCurrentPath(node.id);
    onPathSelected(node.id);
  };

  const resource = useLogicResource<
    FolderBrowserTreeViewNode,
    { treeNodes: FolderBrowserTreeViewNode; error?: ApiResponse }
  >(
    useMemo(() => ({ treeNodes, error }), [treeNodes, error]),
    {
      shouldResolve: ({ treeNodes }) => Boolean(treeNodes),
      shouldReject: ({ error }) => Boolean(error),
      shouldRenew: ({ treeNodes }, resource) => treeNodes === null && resource.complete,
      resultSelector: ({ treeNodes }) => treeNodes,
      errorSelector: ({ error }) => error
    }
  );

  return (
    <Suspencified suspenseProps={{ fallback: <FolderBrowserTreeViewSkeleton /> }}>
      <FolderBrowserTreeViewUI
        onIconClick={onIconClick}
        onLabelClick={onLabelClick}
        rootPath={rootPath}
        currentPath={currentPath}
        expanded={expanded}
        selected={currentPath.replace(/\/$/, '')}
        resource={resource}
        showPathTextBox={showPathTextBox}
        classes={classes}
        disableSelection={true}
      />
    </Suspencified>
  );
}

export default FolderBrowserTreeView;