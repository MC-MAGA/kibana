/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { IRouter, Logger } from '@kbn/core/server';
import { transformError } from '@kbn/securitysolution-es-utils';

import { GET_ILM_EXPLAIN, INTERNAL_API_VERSION } from '../../common/constants';
import { fetchILMExplain } from '../lib';
import { buildResponse } from '../lib/build_response';
import { buildRouteValidation } from '../schemas/common';
import { GetILMExplainParams } from '../schemas/get_ilm_explain';

export const getILMExplainRoute = (router: IRouter, logger: Logger) => {
  router.versioned
    .get({
      path: GET_ILM_EXPLAIN,
      access: 'internal',
    })
    .addVersion(
      {
        version: INTERNAL_API_VERSION,
        validate: {
          request: {
            params: buildRouteValidation(GetILMExplainParams),
          },
        },
      },
      async (context, request, response) => {
        const resp = buildResponse(response);

        try {
          const { client } = (await context.core).elasticsearch;
          const decodedIndexName = decodeURIComponent(request.params.pattern);

          const ilmExplain = await fetchILMExplain(client, decodedIndexName);

          return response.ok({
            body: ilmExplain.indices,
          });
        } catch (err) {
          const error = transformError(err);

          logger.error(error.message);
          return resp.error({
            body: error.message,
            statusCode: error.statusCode,
          });
        }
      }
    );
};
