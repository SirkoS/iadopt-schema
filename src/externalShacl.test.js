import assert from 'node:assert';
import { execSync } from 'node:child_process';
import { promises as Fs } from 'node:fs';
import Path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import Clc from 'cli-color';

// important paths
// https://stackoverflow.com/a/55944697/1169798
const PATH_ROOT = Path.resolve( Path.dirname( fileURLToPath(import.meta.url) ), '..' );
const PATH_TEST = Path.join( PATH_ROOT, 'tests' );
const PATH_TEST_VALID = Path.join( PATH_TEST, 'valid' );
const PATH_TEST_INVALID = Path.join( PATH_TEST, 'invalid' );
const PATH_SHACL = Path.join( PATH_ROOT, 'shacl', 'iadopt.sh.ttl' );


// tests
describe('SHACL external | valid examples', async () => {

  for await(const rawFilePath of Fs.glob( '**/*.ttl', { cwd: PATH_TEST_VALID } ) ) {

    it( `should validate ${rawFilePath}`, async () => {

        // load data file
        const filepath = Path.join( PATH_TEST_VALID, rawFilePath );

        // run validation
        const result = runJava(filepath);

        // log
        assert.ok( result?.['sh:conforms']?.['@value'] === 'true', 'should validate' );
    } )

  }
});

describe('SHACL external | invalid examples', async () => {

  for await(const rawFilePath of Fs.glob( '**/*.ttl', { cwd: PATH_TEST_INVALID } ) ) {

    it( `should not validate ${rawFilePath}`, async () => {

        // load data file
        const filepath = Path.join( PATH_TEST_INVALID, rawFilePath );

        // run validation
        const result = runJava(filepath);

        // log
        assert.ok( result?.['sh:conforms']?.['@value'] != 'true', 'should not validate' );

    } )

  }
});


function runJava( filepath ) {

  const command = [
    'java -jar ./validator.jar ',
    `-contentToValidate ${filepath}`,
    `-externalShapes ${PATH_SHACL}`,
    '-reportSyntax application/ld+json',
    '-nooutput',
    '-clireports'
  ].join( ' ' );
  const raw = execSync( command, {
    cwd: PATH_ROOT,
    stdio : 'pipe' // disables error / warning output
  } ).toString();

  try {
    return JSON.parse( raw );
  } catch (_) {
    console.log( Clc.red( 'Could not parse output - check log file!' ) );
    console.log( Clc.red( raw ) );
    console.log( command );
    process.exit();
  }

}