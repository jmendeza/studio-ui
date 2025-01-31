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

import { UNDEFINED } from '../../utils/constants';
import Person from '../../models/Person';
import { Dispatch, SetStateAction } from 'react';
import useSpreadState from '../../hooks/useSpreadState';

export interface CommonDashletProps {
  contentHeight?: number | string;
  borderLeftColor?: string;
}

export function parseDashletContentHeight(contentHeight: string | number): number {
  return contentHeight ? parseInt(`${contentHeight}`.replace('px', '')) : UNDEFINED;
}

export function getPersonFullName(person: Person): string {
  return `${person.firstName} ${person.lastName}`;
}

export interface WithSelectedStateItem {
  id: string | number;
}

export interface WithSelectedState<ItemType extends WithSelectedStateItem = { id: string | number }> {
  items: ItemType[];
  isAllSelected: boolean;
  hasSelected: boolean;
  selected: Record<string | number, boolean>;
  selectedCount: number;
}

export function useSpreadStateWithSelected<S extends WithSelectedState>(
  initialState: Omit<S, keyof WithSelectedState> & Partial<WithSelectedState>
): [
  S,
  Dispatch<SetStateAction<Partial<S>>>,
  (e, item: WithSelectedStateItem) => void,
  (e) => void,
  <T extends WithSelectedStateItem>(item: T) => boolean
] {
  // @ts-ignore - Unsure how to make the compiler happy. Probably due to the generic ItemType of WithSelectedState.
  const [state, setState] = useSpreadState<S>({
    items: null,
    isAllSelected: false,
    hasSelected: false,
    selected: {},
    selectedCount: 0,
    ...initialState
  });
  const { items, selected } = state;
  const onSelectAll = (e) => {
    if (items.length > 0) {
      const nextState: Partial<S> = {};
      if (e.target.checked) {
        // Check all
        nextState.hasSelected = true;
        nextState.selectedCount = items.length;
        nextState.selected = items.reduce((state, item) => {
          state[item.id] = true;
          return state;
        }, {});
        nextState.isAllSelected = true;
      } else {
        // Uncheck all
        nextState.selected = {};
        nextState.hasSelected = false;
        nextState.isAllSelected = false;
        nextState.selectedCount = 0;
      }
      setState(nextState);
    }
  };
  const onSelectItem = (e, item) => {
    let isChecked = e.target.checked;
    let nextState: Partial<S> = {};
    nextState.selected = { ...selected, [item.id]: isChecked };
    let checkedOnly = Object.values(nextState.selected).filter(Boolean);
    nextState.hasSelected = checkedOnly.length > 0;
    nextState.isAllSelected = items.length && checkedOnly.length === items.length;
    nextState.selectedCount = isChecked ? state.selectedCount + 1 : state.selectedCount - 1;
    setState(nextState);
  };
  const isSelected = (item) => {
    return selected[item.id] ?? false;
  };
  return [state, setState, onSelectItem, onSelectAll, isSelected];
}
