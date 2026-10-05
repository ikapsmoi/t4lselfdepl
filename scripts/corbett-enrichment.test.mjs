import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repository = fileURLToPath(new URL('..', import.meta.url));
const scriptPath = resolve(repository, 'scripts/corbett-enrichment.mjs');
const sourcePath = resolve(repository, 'public/jim-corbett/resorts.json');
const runImport = (cwd, csvPath) => spawnSync(
  process.execPath,
  [scriptPath, '--import', csvPath],
  { cwd, encoding: 'utf8' },
);

test('verified enrichment import records provenance and rejects future dates without writing', async () => {
  const scratch = await mkdtemp(join(tmpdir(), 't4l-corbett-import-'));
  try {
    const dataDirectory = join(scratch, 'public', 'jim-corbett');
    const dataPath = join(dataDirectory, 'resorts.json');
    await mkdir(dataDirectory, { recursive: true });
    const original = await readFile(sourcePath, 'utf8');
    const dataset = JSON.parse(original);
    await writeFile(dataPath, original, 'utf8');

    const first = dataset.properties[0];
    const headers = 'resort_slug,source_url,verified_by,verified_at,name,property_existence_verified,locality';
    const date = new Date().toISOString().slice(0, 10);
    const values = `${first.slug},https://example.com/property,Reviewer,${date},${first.name},yes,Ramnagar`;
    const validCsv = join(scratch, 'verified.csv');
    await writeFile(validCsv, `${headers}\n${values}\n`, 'utf8');

    const success = runImport(scratch, validCsv);
    assert.equal(success.status, 0, success.stderr || success.stdout);
    const enriched = JSON.parse(await readFile(dataPath, 'utf8'));
    assert.equal(enriched.properties[0].fieldEvidence.name.verified, true);
    assert.equal(enriched.properties[0].fieldEvidence.locality.sourceUrl, 'https://example.com/property');
    assert.equal(enriched.properties[0].propertyExistenceStatus, 'VERIFIED');
    assert.equal(enriched.properties[0].availabilityStatus, 'CONTACT_TO_CHECK');
    assert.equal(enriched.properties[1].dataQuality, 'NEEDS_VERIFICATION');

    const beforeInvalidImport = await readFile(dataPath, 'utf8');
    const future = new Date();
    future.setUTCDate(future.getUTCDate() + 1);
    const invalidCsv = join(scratch, 'future-date.csv');
    await writeFile(invalidCsv, `${headers}\n${first.slug},https://example.com/property,Reviewer,${future.toISOString().slice(0, 10)},${first.name},yes,Ramnagar\n`, 'utf8');
    const failure = runImport(scratch, invalidCsv);
    assert.notEqual(failure.status, 0);
    assert.match(failure.stderr, /verified_at cannot be in the future/);
    assert.equal(await readFile(dataPath, 'utf8'), beforeInvalidImport);
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
});
