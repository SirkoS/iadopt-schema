import assert from 'node:assert';
import { promises as Fs } from 'node:fs';
import Path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv/dist/2020.js';
import rdf from '@zazuko/env-node';
import SHACLValidator from 'rdf-validate-shacl';

// important paths
// https://stackoverflow.com/a/55944697/1169798
const PATH_ROOT = Path.resolve( Path.dirname( fileURLToPath(import.meta.url) ), '..' );
const PATH_TEST = Path.join( PATH_ROOT, 'tests' );
const PATH_TEST_VALID = Path.join( PATH_TEST, 'valid' );
const PATH_TEST_INVALID = Path.join( PATH_TEST, 'invalid' );
const PATH_SHACL = Path.join( PATH_ROOT, 'shacl', 'iadopt.sh.ttl' );

// collect namespaces
const NS = {
  'nerc':   'http://vocab.nerc.ac.uk/collection/',
  'iadopt': 'https://w3id.org/iadopt/ont/',
  'sh':     'http://www.w3.org/ns/shacl#',
  'shape':  'https://w3id.org/iadopt/shacl/',
};

// init SHACL validator
const shapes = await rdf.dataset().import(rdf.fromFile( PATH_SHACL ));
// remove SPARQL constraints
shapes.deleteMatches( undefined, rdf.namedNode(NS.sh + 'sparql'), undefined );
const validator = new SHACLValidator( shapes, { factory: rdf } );


// tests
describe('SHACL JS | valid examples', async () => {

  for await(const rawFilePath of Fs.glob( '**/*.ttl', { cwd: PATH_TEST_VALID } ) ) {

    it( `should validate ${rawFilePath}`, async () => {

        // load data file
        const filepath = Path.join( PATH_TEST_VALID, rawFilePath );
        const data = await rdf.dataset().import(rdf.fromFile( filepath ) );

        // run validation
        const report = await validator.validate(data);

        // log
        assert.deepEqual( report.results, [], 'should validate' );
        // console.table( report.results
        //   .map( (r) => ({
        //     focusNode:  shortenIRI( r.focusNode.value ),
        //     message:    r.message.pop().value,
        //     detail:     r.detail,
        //     path:       shortenIRI( r.path.value ),
        //     value:      r.value && shortenIRI( r.value.value ),
        //     severity:   shortenIRI( r.severity.value ),
        //     sourceConstraintComponent: shortenIRI( r.sourceConstraintComponent.value ),
        //     sourceShape: shortenIRI( r.sourceShape.value ),
        //   }))
        //   .sort( (a,b) => a.focusNode.localeCompare( b.focusNode )) );
    } )

  }
});

describe('SHACL JS | invalid examples', async () => {

  for await(const rawFilePath of Fs.glob( '**/*.ttl', { cwd: PATH_TEST_INVALID } ) ) {

    it( `should not validate ${rawFilePath}`, async () => {

        // load data file
        const filepath = Path.join( PATH_TEST_INVALID, rawFilePath );
        const data = await rdf.dataset().import(rdf.fromFile( filepath ) );

        // run validation
        const report = await validator.validate(data);

        // log
        assert.ok( report.results.length > 0, 'should not validate' );

    } )

  }
});





/**
 * replace parts of iri with a prefix, if possible
 * @param {String} iri
 * @returns {String}
 */
function shortenIRI( iri ) {
  for( const [prefix, long] of Object.entries( NS ) ) {
    if( iri.startsWith( long ) ) {
      return iri.replace( long, `${prefix}:` );
    }
  }
  // didn't find a match
  return iri;
}
