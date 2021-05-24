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

import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import RemoteRepositoriesPullDialogContainer, {
  RemoteRepositoriesPullDialogContainerProps
} from './RemoteRepositoriesPullDialogContainer';

export default function RemoteRepositoriesPullDialog(props: RemoteRepositoriesPullDialogContainerProps) {
  const { open, onClose } = props;
  const [disableQuickDismiss, setDisableQuickDismiss] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      disableBackdropClick={disableQuickDismiss}
      disableEscapeKeyDown={disableQuickDismiss}
    >
      <RemoteRepositoriesPullDialogContainer {...props} setDisableQuickDismiss={setDisableQuickDismiss} />
    </Dialog>
  );
}
