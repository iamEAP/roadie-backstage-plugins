/*
 * Copyright 2021 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import React from 'react';
import { render } from '@testing-library/react';
import { githubAuthApiRef } from '@backstage/core-plugin-api';
import { ApiProvider, ApiRegistry } from '@backstage/core-app-api';
import { rest } from 'msw';
import { msw, wrapInTestApp } from '@backstage/test-utils';
import { setupServer } from 'msw/node';
import { contributorsResponseMock, entityMock } from '../../../mocks/mocks';
import { ThemeProvider } from '@material-ui/core';
import { lightTheme } from '@backstage/theme';
import { ContributorsCard } from '..';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { scmIntegrationsApiRef } from '@backstage/integration-react';
import {
  createScmIntegrationsApiMock,
  defaultIntegrationsConfig,
} from '../../../mocks/scmIntegrationsApiMock';

const mockGithubAuth = {
  getAccessToken: async (_: string[]) => 'test-token',
};

const apis = ApiRegistry.from([
  [githubAuthApiRef, mockGithubAuth],
  [
    scmIntegrationsApiRef,
    createScmIntegrationsApiMock(defaultIntegrationsConfig),
  ],
]);

describe('ContributorsCard', () => {
  const worker = setupServer();
  msw.setupDefaultHandlers(worker);

  beforeEach(() => {
    worker.use(
      rest.get(
        'https://api.github.com/repos/mcalus3/backstage/contributors?per_page=10',
        (_, res, ctx) => res(ctx.json(contributorsResponseMock)),
      ),
    );
  });

  it('should display a card with the data from the requests', async () => {
    const rendered = render(
      wrapInTestApp(
        <ApiProvider apis={apis}>
          <ThemeProvider theme={lightTheme}>
            <EntityProvider entity={entityMock}>
              <ContributorsCard />
            </EntityProvider>
          </ThemeProvider>
        </ApiProvider>,
      ),
    );

    expect(await rendered.findByText('People')).toBeInTheDocument();
    expect(await rendered.getByAltText('Rugvip')).toBeInTheDocument();
  });
});
