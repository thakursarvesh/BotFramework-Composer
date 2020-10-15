import { createWriteStream } from 'fs';
import { ensureDirSync, removeSync } from 'fs-extra';
import fetch, { RequestInit } from 'node-fetch';
import { join } from 'path';
import { authService } from '../services/auth';
// import { useElectronContext } from '../utility/electronContext';

import { BotContentInfo, ContentProviderMetadata, ExternalContentProvider } from './externalContentProvider';

type PowerVirtualAgentsMetadata = ContentProviderMetadata & {
  botId?: string;
  description?: string; // maybe we can derive this from the bot content
  dialogId?: string;
  envId?: string;
  name?: string; // maybe we can derive this from the bot content
  tenantId?: string;
  triggerId?: string;
};

//const baseUrl = 'https://bots.int.customercareintelligence.net'; // int = test environment
// const baseUrl = 'https://bots.ppe.customercareintelligence.net'; // ppe
//const baseUrl = 'https://powerva.microsoft.com'; // prod
const authCredentials = {
  clientId: 'ce48853e-0605-4f77-8746-d70ac63cc6bc',
  scopes: ['a522f059-bb65-47c0-8934-7db6e5286414/.default'], // int / ppe
};

function getBaseUrl(): string {
  const env = process.env.COMPOSER_PVA_ENV;
  switch (env) {
    case 'INT':
      return 'https://bots.int.customercareintelligence.net';

    case 'PPE':
      return 'https://bots.ppe.customercareintelligence.net';

    case 'PROD':
      return 'https://powerva.microsoft.com';

    default:
      return 'https://bots.int.customercareintelligence.net';
  }
}

export class PowerVirtualAgentsProvider extends ExternalContentProvider {
  private tempBotAssetsDir = join(process.env.COMPOSER_TEMP_DIR as string, 'pva-assets');

  constructor(metadata: PowerVirtualAgentsMetadata) {
    super(metadata);
  }

  public async downloadBotContent(): Promise<BotContentInfo> {
    try {
      // fetch zip
      const url = this.getContentUrl();
      const options: RequestInit = {
        method: 'GET',
        headers: await this.getRequestHeaders(),
      };
      const result = await fetch(url, options);

      const eTag = result.headers.get('etag') || '';
      const contentType = result.headers.get('content-type');
      if (!contentType || contentType !== 'application/zip') {
        const json = await result.json();
        console.error('ERROR: Did not receive zip back from PVA');
        console.error(json);
        throw `Did not receive zip back from PVA: ${json}`;
      }

      // write the zip to disk
      if (result && result.body) {
        ensureDirSync(this.tempBotAssetsDir);
        const zipPath = join(this.tempBotAssetsDir, 'bot-assets.zip');
        const writeStream = createWriteStream(zipPath);
        await new Promise((resolve, reject) => {
          writeStream.once('finish', resolve);
          writeStream.once('error', reject);
          result.body.pipe(writeStream);
        });
        return { eTag, zipPath };
      } else {
        throw 'Response containing zip does not have a body';
      }
    } catch (e) {
      return Promise.reject(new Error(`Error while trying to download the bot content: ${e}`));
    }
  }

  public async cleanUp(): Promise<void> {
    removeSync(this.tempBotAssetsDir);
  }

  private async getAccessToken(): Promise<string> {
    try {
      if (process.env.COMPOSER_PVA_TOKEN) {
        console.log('Using env-set access token: ', process.env.COMPOSER_PVA_TOKEN);
        return process.env.COMPOSER_PVA_TOKEN;
      }
      // login to the 1P app and get an access token
      const accessToken = await authService.getAccessToken(authCredentials);
      return accessToken;
    } catch (e) {
      return Promise.reject(new Error(`Error while trying to get a PVA access token: ${e}`));
    }
  }

  private getContentUrl(): string {
    const { envId, botId } = this.metadata;
    //return `${baseUrl}/api/botmanagement/v1/environments/${envId}/bots/${botId}/composer/content`;
    const url = getBaseUrl();
    console.log('grabbing PVA bot content from: ', url);
    return `${url}/api/botmanagement/v1/environments/${envId}/bots/${botId}/composer/content`;
  }

  private async getRequestHeaders() {
    const { tenantId } = this.metadata;
    const token = await this.getAccessToken();
    return {
      Authorization: `Bearer ${token}`,
      'X-CCI-TenantId': tenantId,
      'X-CCI-Routing-TenantId': tenantId,
    };
  }
}
