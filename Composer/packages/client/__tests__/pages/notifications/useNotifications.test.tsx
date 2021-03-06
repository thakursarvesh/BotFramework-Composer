// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { RecoilRoot } from 'recoil';
import { renderHook } from '@botframework-composer/test-utils/lib/hooks';
import { Range, Position } from '@bfc/shared';

import useNotifications from '../../../src/pages/notifications/useNotifications';
import {
  dialogsState,
  luFilesState,
  lgFilesState,
  settingsState,
  schemasState,
  currentProjectIdState,
  botDiagnosticsState,
  jsonSchemaFilesState,
  botProjectIdsState,
  formDialogSchemaIdsState,
} from '../../../src/recoilModel';
import mockProjectResponse from '../../../src/recoilModel/dispatchers/__tests__/mocks/mockProjectResponse.json';

const state = {
  projectId: 'test',
  dialogs: [
    {
      id: 'test',
      content: 'test',
      luFile: 'test',
      referredLuIntents: [],
      skills: [`=settings.skill['Email-Skill'].endpointUrl`],
    },
  ],
  luFiles: [
    {
      content: 'test',
      id: 'test.en-us',
      intents: [
        {
          Body: '- test12345 ss',
          Entities: [],
          Name: 'test',
          range: new Range(new Position(4, 0), new Position(7, 14)),
        },
      ],
      diagnostics: [
        {
          message: 'lu syntax error',
          severity: 0,
          source: 'test.en-us',
          range: {
            end: { character: 2, line: 7 },
            start: { character: 0, line: 7 },
          },
        },
      ],
    },
  ],
  lgFiles: [
    {
      content: 'test',
      id: 'test.en-us',
      templates: [
        {
          body: '- ${add(1,2)}',
          name: 'bar',
          range: new Range(new Position(0, 0), new Position(2, 14)),
        },
      ],
      diagnostics: [
        {
          message: 'lg syntax error',
          severity: 1,
          source: 'test.en-us',
          range: {
            end: { character: 2, line: 13 },
            start: { character: 0, line: 13 },
          },
        },
      ],
    },
  ],
  jsonSchemaFiles: [
    {
      id: 'schema1.json',
      content: 'test',
    },
  ],
  diagnostics: [
    {
      message: 'server error',
      severity: 0,
      source: 'server',
    },
  ],
  settings: {
    skill: {
      'Email-Skill': {
        manifestUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/manifest/manifest-1.0.json',
        endpointUrl: 'https://yuesuemailskill0207-gjvga67.azurewebsites.net/api/messages',
        name: 'Email-Skill',
      },
    },
  },
  formDialogSchemas: [{ id: '1', content: '{}' }],
};

const initRecoilState = ({ set }) => {
  set(currentProjectIdState, state.projectId);
  set(botProjectIdsState, [state.projectId]);
  set(dialogsState(state.projectId), state.dialogs);
  set(luFilesState(state.projectId), state.luFiles);
  set(lgFilesState(state.projectId), state.lgFiles);
  set(jsonSchemaFilesState(state.projectId), state.jsonSchemaFiles);
  set(botDiagnosticsState(state.projectId), state.diagnostics);
  set(settingsState(state.projectId), state.settings);
  set(schemasState(state.projectId), mockProjectResponse.schemas);
  set(
    formDialogSchemaIdsState(state.projectId),
    state.formDialogSchemas.map((fds) => fds.id)
  );
};

describe('useNotification hooks', () => {
  let renderedResult;
  beforeEach(() => {
    const wrapper = (props: { children?: React.ReactNode }) => {
      const { children } = props;
      return <RecoilRoot initializeState={initRecoilState}>{children}</RecoilRoot>;
    };

    const { result } = renderHook(() => useNotifications(state.projectId), {
      wrapper,
    });
    renderedResult = result;
  });

  it('should return notifications', () => {
    expect(renderedResult.current.length).toBe(4);
  });

  it('should return filtered notifications', () => {
    const wrapper = (props: { children?: React.ReactNode }) => {
      const { children } = props;
      return <RecoilRoot initializeState={initRecoilState}>{children}</RecoilRoot>;
    };

    const { result } = renderHook(() => useNotifications(state.projectId, 'Error'), {
      wrapper,
    });

    expect(result.current.length).toBe(2);
  });
});
