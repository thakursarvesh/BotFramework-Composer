// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';
import path from 'path';
import http from 'http';

import { Orchestrator } from "@microsoft/bf-orchestrator";


// Take same parameters from req.body as the luPublisher pipeline
interface context {
  authoringKey: string, //not required, but passed in to luPublisher for LUIS
  projectId: string
  crossTrainConfig: {
    rootIds: string[],
    triggerRules: any
  },
  luFiles: string[]
}

async function getProjectDetails(botId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    let chunks: any = [];
    http.get(
      { hostname: 'localhost', port: process.env.PORT, path: `/api/projects/${botId}`, agent: false },
      response => {
        response.on('data', data => {
          chunks.push(data);
        }).on('end', () => {
          let response_body = Buffer.concat(chunks);
          resolve(JSON.parse(response_body.toString()));
        }).on('error', reject)
      });
  })
}

async function buildOrchestratorSnapshot(req: Request, res: Response) {
  const params = req.body as context;

  if (params?.crossTrainConfig?.rootIds == null) {
    return res.status(400).json({ message: "Missing training config" });
  }

  const projectData = await getProjectDetails(params.projectId);

  const projectFolder = projectData.location;
  const LuFolder = path.resolve(projectFolder, 'language-understanding');
  const GeneratedFolder = path.resolve(projectFolder, 'generated');
  const nlrPath = path.resolve("..", "..", "plugins", "orchestrator", "NLR");

  console.log("Project Folder: " + projectFolder);
  console.log("Input LU Folder for Orchestrator: " + LuFolder);
  console.log("Model Folder for Orchestrator: " + nlrPath);

  try {
    await Orchestrator.createAsync(nlrPath, LuFolder, GeneratedFolder);
    res.status(200).json({ message: "Successfully Created Snapshot" });
  } catch (e) {
    res.status(400).json({ message: e });
  }
}

export default async (composer: any): Promise<void> => {
  await composer.addWebRoute('post', '/Orchestrator/create', buildOrchestratorSnapshot);
};
