// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

//TODO: refactor the router to use one-way data flow
import { useRecoilCallback, CallbackInterface } from 'recoil';
import { PromptTab, SDKKinds } from '@bfc/shared';
import cloneDeep from 'lodash/cloneDeep';

import { botProjectSpaceLoadedState } from '../atoms';

import { createSelectedPath, getSelected } from './../../utils/dialogUtil';
import { BreadcrumbItem } from './../../recoilModel/types';
import { breadcrumbState, designPageLocationState, focusPathState, dialogsState } from './../atoms/botState';
import {
  BreadcrumbUpdateType,
  checkUrl,
  convertPathToUrl,
  getUrlSearch,
  navigateTo,
  updateBreadcrumb,
} from './../../utils/navigation';

export const navigationDispatcher = () => {
  const setDesignPageLocation = useRecoilCallback(
    ({ set }: CallbackInterface) => async (
      projectId: string,
      { dialogId = '', selected = '', focused = '', breadcrumb = [], promptTab }
    ) => {
      let focusPath = dialogId + '#';
      if (focused) {
        focusPath = dialogId + '#.' + focused;
      } else if (selected) {
        focusPath = dialogId + '#.' + selected;
      }

      set(focusPathState(projectId), focusPath);
      //add current path to the breadcrumb
      set(breadcrumbState(projectId), [...breadcrumb, { dialogId, selected, focused }]);
      set(designPageLocationState(projectId), {
        projectId,
        dialogId,
        selected,
        focused,
        promptTab: Object.values(PromptTab).find((value) => promptTab === value),
      });
    }
  );

  const navTo = useRecoilCallback(
    ({ snapshot }: CallbackInterface) => async (
      projectId: string,
      dialogId: string,
      breadcrumb: BreadcrumbItem[] = []
    ) => {
      const isLoaded = await snapshot.getPromise(botProjectSpaceLoadedState);
      const dialogs = await snapshot.getPromise(dialogsState(projectId));
      const designPageLocation = await snapshot.getPromise(designPageLocationState(projectId));
      const updatedBreadcrumb = cloneDeep(breadcrumb);

      let path;
      if (dialogId !== designPageLocation.dialogId) {
        const currentDialog = dialogs.find(({ id }) => id === dialogId);
        const beginDialogIndex = currentDialog?.triggers.findIndex(({ type }) => type === SDKKinds.OnBeginDialog);

        if (typeof beginDialogIndex !== 'undefined' && beginDialogIndex >= 0) {
          path = createSelectedPath(beginDialogIndex);
          updatedBreadcrumb.push({ dialogId, selected: '', focused: '' });
        }
      }

      const currentUri = convertPathToUrl(projectId, dialogId, path);

      if (checkUrl(currentUri, projectId, designPageLocation)) return;

      navigateTo(currentUri, { state: { breadcrumb: updatedBreadcrumb } });
    }
  );

  const selectTo = useRecoilCallback(
    ({ snapshot }: CallbackInterface) => async (
      projectId: string,
      dialogId: string | undefined,
      selectPath: string | undefined
    ) => {
      if (!selectPath) return;
      const designPageLocation = await snapshot.getPromise(designPageLocationState(projectId));
      // const breadcrumb = await snapshot.getPromise(breadcrumbState(projectId));

      // initial dialogId, projectId maybe empty string  ""
      dialogId = dialogId ?? designPageLocation.dialogId ?? 'Main';

      const currentUri = convertPathToUrl(projectId, dialogId, selectPath);

      if (checkUrl(currentUri, projectId, designPageLocation)) return;
      navigateTo(currentUri, { state: { breadcrumb: [{ dialogId, selected: '', focused: '' }] } });
    }
  );

  const focusTo = useRecoilCallback(
    ({ snapshot }: CallbackInterface) => async (projectId: string, focusPath: string, fragment: string) => {
      const designPageLocation = await snapshot.getPromise(designPageLocationState(projectId));
      const breadcrumb = await snapshot.getPromise(breadcrumbState(projectId));
      let updatedBreadcrumb = [...breadcrumb];
      const { dialogId, selected } = designPageLocation;

      let currentUri = `/bot/${projectId}/dialogs/${dialogId}`;

      if (focusPath) {
        const targetSelected = getSelected(focusPath);
        if (targetSelected !== selected) {
          updatedBreadcrumb = updateBreadcrumb(breadcrumb, BreadcrumbUpdateType.Selected);
          updatedBreadcrumb.push({ dialogId, selected: targetSelected, focused: '' });
        }
        currentUri = `${currentUri}?selected=${targetSelected}&focused=${focusPath}`;
        updatedBreadcrumb = updateBreadcrumb(breadcrumb, BreadcrumbUpdateType.Focused);
      } else {
        currentUri = `${currentUri}?selected=${selected}`;
        updatedBreadcrumb = updateBreadcrumb(breadcrumb, BreadcrumbUpdateType.Selected);
      }

      if (fragment && typeof fragment === 'string') {
        currentUri += `#${fragment}`;
      }
      if (checkUrl(currentUri, projectId, designPageLocation)) return;
      navigateTo(currentUri, { state: { breadcrumb: updatedBreadcrumb } });
    }
  );

  const selectAndFocus = useRecoilCallback(
    ({ snapshot }: CallbackInterface) => async (
      projectId: string,
      dialogId: string,
      selectPath: string,
      focusPath: string,
      breadcrumb: BreadcrumbItem[] = []
    ) => {
      const search = getUrlSearch(selectPath, focusPath);
      const designPageLocation = await snapshot.getPromise(designPageLocationState(projectId));
      if (search) {
        const currentUri = `/bot/${projectId}/dialogs/${dialogId}${getUrlSearch(selectPath, focusPath)}`;

        if (checkUrl(currentUri, projectId, designPageLocation)) return;
        navigateTo(currentUri, { state: { breadcrumb } });
      } else {
        navTo(projectId, dialogId, breadcrumb);
      }
    }
  );

  return {
    setDesignPageLocation,
    navTo,
    selectTo,
    focusTo,
    selectAndFocus,
  };
};
