import assert from 'node:assert';
import { promises as Fs } from 'node:fs';
import Path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv/dist/2020.js';


// important paths
// https://stackoverflow.com/a/55944697/1169798
const PATH_ROOT = Path.resolve( Path.dirname( fileURLToPath(import.meta.url) ), '..' );
const PATH_SCHEMA = Path.join( PATH_ROOT, 'json', 'Variable.schema.json' );
const PATH_TEST = Path.join( PATH_ROOT, 'tests' );
const PATH_TEST_VALID = Path.join( PATH_TEST, 'valid' );
const PATH_TEST_INVALID = Path.join( PATH_TEST, 'invalid' );

// load JSON schema
const schema = JSON.parse( await Fs.readFile( PATH_SCHEMA ) );
const ajv = new Ajv({ strict:false });
const validator = ajv.compile( schema );


// tests
describe('JSON-schema | valid examples', async () => {

  for await(const rawFilePath of Fs.glob( '**/*.jsonld', { cwd: PATH_TEST_VALID } ) ) {

    it( `should validate ${rawFilePath}`, async () => {

        // load data file
        const filepath = Path.join( PATH_TEST_VALID, rawFilePath );
        const data = JSON.parse( await Fs.readFile( filepath ) );

        // run validation
        const res = validator( data );

        // log
        assert.deepEqual( validator.errors, null, 'should not contain any errors' );
        assert.ok( res, 'should validate' );

    } )

  }
});

describe('JSON-schema | invalid examples', async () => {

  for await(const rawFilePath of Fs.glob( '**/*.jsonld', { cwd: PATH_TEST_INVALID } ) ) {

    it( `should not validate ${rawFilePath}`, async () => {

        // load data file
        const filepath = Path.join( PATH_TEST_INVALID, rawFilePath );
        const data = JSON.parse( await Fs.readFile( filepath ) );

        // run validation
        const res = validator( data );

        // log
        assert.ok( !res, 'should validate' );
        assert.ok( Array.isArray(validator.errors), 'should return a list of error messages' )

    } )

  }
});
