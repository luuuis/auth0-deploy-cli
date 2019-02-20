/* eslint-disable camelcase */
import fs from 'fs-extra';
import path from 'path';

import log from '../../../logger';
import { existsMustBeDir, isFile, loadJSON } from '../../../utils';

function asIntegerValue(property, hours) {
  return Number.isInteger(hours) ? { [property]: hours } : { [`${property}_in_minutes`]: Math.floor(hours * 60) };
}

function parse(context) {
  const baseFolder = path.join(context.filePath);
  if (!existsMustBeDir(baseFolder)) return {}; // Skip

  const tenantFile = path.join(baseFolder, 'tenant.json');

  if (isFile(tenantFile)) {
    const {
      idle_session_lifetime,
      session_lifetime,
      ...tenant
    } = loadJSON(tenantFile, context.mappings);

    return {
      tenant: Object.assign(
        tenant,
        session_lifetime && asIntegerValue('session_lifetime', session_lifetime),
        idle_session_lifetime && asIntegerValue('idle_session_lifetime', idle_session_lifetime)
      )
    };
  }

  return {};
}

async function dump(context) {
  const { tenant } = context.assets;

  if (!tenant) return; // Skip, nothing to dump

  const tenantFile = path.join(context.filePath, 'tenant.json');
  log.info(`Writing ${tenantFile}`);
  fs.writeFileSync(tenantFile, JSON.stringify(tenant, null, 2));
}


export default {
  parse,
  dump
};
