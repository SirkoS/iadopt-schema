import assert from 'node:assert';
import { promises as Fs } from 'node:fs';
import Path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import rdf from '@zazuko/env-node';
import { tmpdir } from 'node:os';


// important paths
// https://stackoverflow.com/a/55944697/1169798
const PATH_ROOT = Path.resolve( Path.dirname( fileURLToPath(import.meta.url) ), '..' );
const PATH_SCHEMA = Path.join( PATH_ROOT, 'json', 'Variable.schema.json' );
const PATH_TEST = Path.join( PATH_ROOT, 'tests' );
const PATH_TEST_VALID = Path.join( PATH_TEST, 'valid' );
const PATH_TEST_INVALID = Path.join( PATH_TEST, 'invalid' );
const JSONLD_CONTEXT = Path.join( PATH_ROOT, 'json', 'Variable.context.jsonld' );

// read JSON-LD context
const context = JSON.parse( await Fs.readFile( JSONLD_CONTEXT ) );


// tests
describe('JSON-LD Context | valid examples', async () => {

  for await(const jsonldName of Fs.glob( '**/*.jsonld', { cwd: PATH_TEST_VALID } ) ) {

    // only consider cases with a matching TTL file
    const ttlPath = Path.join( PATH_TEST_VALID, jsonldName.replace( '.jsonld', '.ttl' ) );
    if( !await fileExists( ttlPath ) ) {
      continue;
    }


    it( `should have the same result for ${jsonldName.replace( '.jsonld', '' )}`, async () => {

        // need a tmp file to replace the context in JSON-LD
        await using tmpdir = await Fs.mkdtempDisposable('prefix')

        // load JSON-LD file
        const jsonldPath = Path.join( PATH_TEST_VALID, jsonldName );
        const jsonLD = JSON.parse( await Fs.readFile( jsonldPath ) );
        jsonLD['@context'] = context['@context'];
        const tmpPath = Path.join( tmpdir.path, jsonldName )
        await Fs.writeFile( tmpPath, JSON.stringify( jsonLD ) )
        const ldData = await rdf.dataset().import(rdf.fromFile( tmpPath ) );

        // load TTL file
        const ttlData = await rdf.dataset().import(rdf.fromFile( ttlPath ) );

        // assertions
        assert.equal( ldData.toCanonical(), ttlData.toCanonical(), 'should represent the same data in JSON-LD and TTL' );

    } );

  }
});



async function fileExists( path ) {
  try {
    await Fs.access( path );
    return true;
  } catch {
    return false;
  }
}
