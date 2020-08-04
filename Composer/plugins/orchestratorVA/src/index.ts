// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';


async function buildOrchestratorSnapshot(req: Request, res: Response) {
  //const params = req.body.luFiles;
  res.status(200).json({message: "hello"});

  //const orchestrator = new oc.Orchestrator();
  // let labeler = orchestrator.createLabelResolver(); 
  // const load_result = await orchestrator.load('../dep/model'); // Return boolean, separate load.
  // if (load_result === false)
  // {
  //     console.log('Loading NLR failed!!');
  //     res.status(200).json({message:"failed loading NLR"})
  // }
  // const example2 = { 
  //   label: 'schedule', 
  //   text: 'when is my next appointment?',
  //   };
  // let val = labeler.addExample(example2);

  // var results = labeler.score("hey");
  // console.log(results);
  //console.log(util.inspect(results, true, null, true /* enable colors */));

  // const projectId = req.params.projectId;
  // const user = await PluginLoader.getUserFromRequest(req);

  // const currentProject = await BotProjectService.getProjectById(projectId, user);
  // if (currentProject !== undefined) {
  //   try {
  //     const luFiles = await currentProject.publishLuis(
  //       req.body.authoringKey,
  //       req.body.luFiles,
  //       req.body.crossTrainConfig
  //     );
  //     res.status(200).json({ luFiles });
  //   } catch (error) {
  //     res.status(400).json({
  //       message: error instanceof Error ? error.message : error,
  //     });
  //   }
  // } else {
  //   res.status(404).json({
  //     message: 'No such bot project opened',
  //   });
  // }
}

export default async (composer: any): Promise<void> => {
  await composer.addWebRoute('get', '/Orchestrator/create', buildOrchestratorSnapshot);
};
