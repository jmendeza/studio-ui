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

import { ofType, StateObservable } from 'redux-observable';
import { ignoreElements, tap, withLatestFrom } from 'rxjs/operators';
import {
  closeToolsPanel,
  openToolsPanel,
  popIcePanelPage,
  popToolsPanelPage,
  previewItem,
  pushIcePanelPage,
  pushToolsPanelPage,
  setEditModePadding,
  setHighlightMode,
  setPreviewEditMode,
  toggleEditModePadding
} from '../actions/preview';
import { getHostToGuestBus } from '../../utils/subjects';
import {
  removeStoredICEToolsPanelPage,
  removeStoredPreviewToolsPanelPage,
  setStoredClipboard,
  setStoredEditModeChoice,
  setStoredEditModePadding,
  setStoredHighlightModeChoice,
  setStoredICEToolsPanelPage,
  setStoredPreviewToolsPanelPage,
  setStoredShowToolsPanel
} from '../../utils/state';
import GlobalState from '../../models/GlobalState';
import { setClipboard } from '../actions/content';
import { CrafterCMSEpic } from '../store';
import { getSystemLink } from '../../utils/system';

export default [
  // region pushToolsPanelPage
  (action$, state$) =>
    action$.pipe(
      ofType(pushToolsPanelPage.type),
      withLatestFrom(state$),
      tap(([{ type, payload }, state]) => {
        if (payload) {
          const uuid = state.sites.byId?.[state.sites.active].uuid;
          uuid && setStoredPreviewToolsPanelPage(uuid, state.user.username, payload);
        }
      }),
      ignoreElements()
    ),
  // endregion
  // region popToolsPanelPage
  (action$, state$) =>
    action$.pipe(
      ofType(popToolsPanelPage.type),
      withLatestFrom(state$),
      tap(([, state]) => {
        const uuid = state.sites.byId?.[state.sites.active].uuid;
        if (state.preview.toolsPanelPageStack.length && uuid) {
          setStoredPreviewToolsPanelPage(
            uuid,
            state.user.username,
            state.preview.toolsPanelPageStack[state.preview.toolsPanelPageStack.length - 1]
          );
        } else {
          removeStoredPreviewToolsPanelPage(uuid, state.user.username);
        }
      }),
      ignoreElements()
    ),
  // endregion
  // region setPreviewEditMode
  (action$, state$) =>
    action$.pipe(
      ofType(setPreviewEditMode.type),
      withLatestFrom(state$),
      tap(([action, state]) => {
        setStoredEditModeChoice(action.payload.editMode, state.user.username);
        if (action.payload.highlightMode) {
          setStoredHighlightModeChoice(action.payload.highlightMode, state.user.username);
          getHostToGuestBus().next(setHighlightMode(action.payload));
        }
      }),
      ignoreElements()
    ),
  // endregion
  // region setHighlightMode
  (action$, state$) =>
    action$.pipe(
      ofType(setHighlightMode.type),
      withLatestFrom(state$),
      tap(([action, state]) => {
        setStoredHighlightModeChoice(action.payload.highlightMode, state.user.username);
        getHostToGuestBus().next(action);
      }),
      ignoreElements()
    ),
  // endregion
  // region setEditModePadding
  (action$, state$) =>
    action$.pipe(
      ofType(setEditModePadding.type, toggleEditModePadding.type),
      withLatestFrom(state$),
      tap(([action, state]) => {
        const nextValue =
          action.type === setEditModePadding.type ? action.payload.editModePadding : state.preview.editModePadding;
        setStoredEditModePadding(nextValue, state.user.username);
        getHostToGuestBus().next(setEditModePadding({ editModePadding: nextValue }));
      }),
      ignoreElements()
    ),
  // endregion
  // region Clipboard
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(setClipboard.type),
      withLatestFrom(state$),
      tap(([{ payload }, state]) => {
        const uuid = state.sites.byId?.[state.sites.active].uuid;
        uuid && setStoredClipboard(uuid, state.user.username, payload);
      }),
      ignoreElements()
    ),
  // endregion
  // region Go To Page
  (action$, state$: StateObservable<GlobalState>) =>
    action$.pipe(
      ofType(previewItem.type),
      withLatestFrom(state$),
      tap(([{ payload }, state]) => {
        const url = getSystemLink({
          site: state.sites.active,
          systemLinkId: 'preview',
          authoringBase: state.env.authoringBase,
          page: payload.item.previewUrl
        });
        if (payload.newTab) {
          window.open(url);
        } else {
          window.location.href = url;
        }
      }),
      ignoreElements()
    ),
  // endregion
  // region close/open toolbar
  (action$, state$) =>
    action$.pipe(
      ofType(openToolsPanel.type, closeToolsPanel.type),
      withLatestFrom(state$),
      tap(([, state]) => {
        const uuid = state.sites.byId?.[state.sites.active]?.uuid;
        uuid && setStoredShowToolsPanel(uuid, state.user.username, state.preview.showToolsPanel);
      }),
      ignoreElements()
    ),
  // endregion
  // region pushIcePanelPage
  (action$, state$) =>
    action$.pipe(
      ofType(pushIcePanelPage.type),
      withLatestFrom(state$),
      tap(([{ payload }, state]) => {
        if (payload) {
          const uuid = state.sites.byId?.[state.sites.active].uuid;
          uuid && setStoredICEToolsPanelPage(uuid, state.user.username, payload);
        }
      }),
      ignoreElements()
    ),
  // endregion
  // region popIcePanelPage
  (action$, state$) =>
    action$.pipe(
      ofType(popIcePanelPage.type),
      withLatestFrom(state$),
      tap(([, state]) => {
        const uuid = state.sites.byId?.[state.sites.active].uuid;

        if (state.preview.icePanelStack.length && uuid) {
          setStoredICEToolsPanelPage(
            uuid,
            state.user.username,
            state.preview.icePanelStack[state.preview.icePanelStack.length - 1]
          );
        } else {
          removeStoredICEToolsPanelPage(uuid, state.user.username);
        }
      }),
      ignoreElements()
    )
  // endregion
] as CrafterCMSEpic[];
