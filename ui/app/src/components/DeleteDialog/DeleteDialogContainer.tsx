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

import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { useSpreadState } from '../../utils/hooks/useSpreadState';
import { useActiveSiteId } from '../../utils/hooks/useActiveSiteId';
import { useDispatch } from 'react-redux';
import { useUnmount } from '../../utils/hooks/useUnmount';
import { useLogicResource } from '../../utils/hooks/useLogicResource';
import {
  fetchDeleteDependencies,
  fetchDeleteDependenciesComplete,
  showEditDialog,
  updateDeleteDialog
} from '../../state/actions/dialogs';
import { deleteItems } from '../../services/content';
import { emitSystemEvent, itemsDeleted } from '../../state/actions/system';
import { DeleteDialogUI } from './DeleteDialogUI';
import { DeleteDialogBaseProps } from './utils';
import { DialogProps } from '@material-ui/core/Dialog';
import { useSelection } from '../../utils/hooks/useSelection';
import { DeleteDependencies } from '../../modules/Content/Dependencies/DependencySelection';
import { Resource } from '../../models/Resource';
import LookupTable from '../../models/LookupTable';
import { createPresenceTable } from '../../utils/array';
import { DetailedItem } from '../../models/Item';
import { isBlank } from '../../utils/string';
import { batchActions } from '../../state/actions/misc';

export type DeleteDialogContainerProps = PropsWithChildren<
  DeleteDialogBaseProps & {
    onClose: DialogProps['onClose'];
    onClosed?(): any;
    onSuccess?(response?: any): any;
  }
>;

function createCheckedList(selectedItems: LookupTable<boolean>, excludedPaths?: string[]) {
  return Object.entries(selectedItems)
    .filter(([path, isChecked]) => isChecked && !excludedPaths?.includes(path))
    .map(([path]) => path);
}

function createCheckedLookup(items: Array<DetailedItem | string>, setChecked = true) {
  const isString = typeof items[0] === 'string';
  return items.reduce((checked, item) => {
    // @ts-ignore - `isString` above pre-checks the type, typescript doesn't realise this is safe by this point.
    checked[isString ? item : item.path] = setChecked;
    return checked;
  }, {});
}

export function DeleteDialogContainer(props: DeleteDialogContainerProps) {
  const { items, onClose, onSuccess, isFetching, onClosed, childItems, dependentItems } = props;
  const [comment, setComment] = useState('');
  const [apiState, setApiState] = useSpreadState({
    error: null,
    submitting: false
  });
  const site = useActiveSiteId();
  const isCommentRequired = useSelection((state) => state.uiConfig.publishing.deleteCommentRequired);
  const [selectedItems, setSelectedItems] = useState<LookupTable<boolean>>({});
  const dispatch = useDispatch();
  const depsSource = useMemo(() => ({ childItems, dependentItems, apiState, isFetching }), [
    childItems,
    dependentItems,
    apiState,
    isFetching
  ]);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const authoringBase = useSelection((state) => state.env.authoringBase);

  const onSubmit = () => {
    const paths = createCheckedList(selectedItems);
    setApiState({ submitting: true });
    dispatch(updateDeleteDialog({ disableQuickDismiss: true }));
    deleteItems(site, paths, comment).subscribe(
      (response) => {
        setApiState({ submitting: false });
        dispatch(
          batchActions([
            updateDeleteDialog({ disableQuickDismiss: false }),
            emitSystemEvent(itemsDeleted({ targets: paths.concat(childItems ?? []) }))
          ])
        );
        onSuccess?.({
          ...response,
          items: paths.map((path) => items.find((item) => item.path === path))
        });
      },
      (error) => {
        setApiState({ error, submitting: false });
      }
    );
  };

  const onCommentChange = (e) => setComment(e.target.value);

  const onDismiss = () => onClose({}, null);

  const fetchOrCleanDependencies = (nextChecked) => {
    let paths = createCheckedList(nextChecked, dependentItems);
    if (paths.length) {
      dispatch(fetchDeleteDependencies({ paths }));
    } else {
      dispatch(fetchDeleteDependenciesComplete({ dependentItems: [], childItems: [] }));
    }
  };

  const onItemClicked = (e, path) => {
    let nextChecked = { ...selectedItems, [path]: !selectedItems[path] };
    // Clean the state, only keep checked items
    !nextChecked[path] && delete nextChecked[path];
    // If there aren't any checked main items, uncheck everything.
    const checkedMainItems = createCheckedList(nextChecked, dependentItems);
    checkedMainItems.length === 0 && (nextChecked = {});
    // Only recalculate dependencies for changes the main set items, not dependant.
    !dependentItems.includes(path) && fetchOrCleanDependencies(nextChecked);
    setSelectedItems(nextChecked);
  };

  const onSelectAllClicked = () => {
    const setChecked = Boolean(items.find((item) => !selectedItems[item.path]));
    // If the "select all" checkbox is working to check all, then clean all `false`s and
    // check all main items. Otherwise, if it's working to uncheck all, everything should get
    // unchecked (both main & dependant items).
    const nextChecked = setChecked
      ? {
          ...createPresenceTable(
            createCheckedList(
              selectedItems,
              items.map((item) => item.path)
            )
          ),
          ...createCheckedLookup(items, setChecked)
        }
      : {};
    fetchOrCleanDependencies(nextChecked);
    setSelectedItems(nextChecked);
  };

  const onSelectAllDependantClicked = () => {
    const setChecked = Boolean(dependentItems.find((path) => !selectedItems[path]));
    // Clean up all set to `false` from the selected lookup.
    const cleanLookup = createPresenceTable(createCheckedList(selectedItems, dependentItems));
    const nextChecked = {
      ...cleanLookup,
      // If "select all" checkbox is working as check all, add all dependant items. If checkbox is working
      // as "uncheck all", then simply don't add anything. All dependant items would have gotten cleaned up
      // on the `cleanLookup` creation above.
      ...(setChecked && createCheckedLookup(dependentItems, setChecked))
    };
    setSelectedItems(nextChecked);
  };

  const onConfirmChange = (e) => {
    setConfirmChecked(e.target.checked);
  };

  const onEditDependantClick = (e, path) => {
    let paths = createCheckedList(selectedItems, dependentItems);
    // We don't have a good way of knowing if the dependant item cleared it's dependency and if it's checked, it
    // needs to get removed from selectedItems after the edit is complete and the item is not even listed as a dependency.
    // Until we find a better way around that, will uncheck when the edit button is pressed.
    selectedItems[path] && onItemClicked(null, path);
    dispatch(showEditDialog({ path, authoringBase, site, onSaveSuccess: fetchDeleteDependencies({ paths }) }));
  };

  useUnmount(onClosed);

  const resource: Resource<DeleteDependencies> = useLogicResource(depsSource, {
    shouldResolve: (source) => Boolean(source.childItems && source.dependentItems && !source.isFetching),
    shouldReject: (source) => Boolean(source.apiState.error),
    shouldRenew: (source, resource) => resource.complete,
    resultSelector: (source) => ({ childItems: source.childItems, dependentItems: source.dependentItems }),
    errorSelector: (source) => source.apiState.error
  });

  useEffect(() => {
    if (items.length) {
      const nextChecked = createPresenceTable(items, true, (item) => item.path);
      setSelectedItems(nextChecked);
      dispatch(fetchDeleteDependencies({ paths: items.map((i) => i.path) }));
    }
  }, [dispatch, items]);

  useEffect(() => {
    setSubmitDisabled(
      apiState.submitting ||
        Object.values(selectedItems).length === 0 ||
        (isCommentRequired && isBlank(comment)) ||
        !confirmChecked
    );
  }, [apiState.submitting, comment, isCommentRequired, selectedItems, confirmChecked]);

  return (
    <DeleteDialogUI
      resource={resource}
      items={items}
      selectedItems={selectedItems}
      comment={comment}
      onCommentChange={onCommentChange}
      isDisabled={apiState.submitting}
      isSubmitting={apiState.submitting}
      onSubmit={onSubmit}
      onDismiss={onDismiss}
      isCommentRequired={isCommentRequired}
      isSubmitButtonDisabled={submitDisabled}
      onItemClicked={onItemClicked}
      onSelectAllClicked={onSelectAllClicked}
      onSelectAllDependantClicked={onSelectAllDependantClicked}
      onConfirmDeleteChange={onConfirmChange}
      isConfirmDeleteChecked={confirmChecked}
      onEditDependantClick={onEditDependantClick}
    />
  );
}