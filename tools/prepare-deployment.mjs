import {resolve} from 'node:path';
import {createDeploymentSnapshot} from './lib/deployment-snapshot.mjs';
const root=resolve(import.meta.dirname,'..');
const result=await createDeploymentSnapshot(resolve(root,'site'),resolve(root,'data/deployment/site-snapshot.json.gz'));
console.log(`Snapshot de publicação: ${result.snapshotId} · ${result.files} arquivos · ${(result.bytes/1024/1024).toFixed(2)} MB · SHA-256 ${result.sha256}`);
