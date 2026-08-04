# I-Adopt

This is the development repo for validations to the [I-Adopt framework](https://w3id.org/iadopt/).
It contains

* [SHACL shapes](./shacl/iadopt.sh.ttl)
* JSON-LD context
  * [Variable](./json/context.jsonld)
* JSON schema
  * [Variable](./json/schema.json)

and a few testing tools.

See [`tests/valid`](./tests/valid/) for valid examples for JSON-LD-encoded Variables.

**Note: JSON-LD schemas have not yet been updated to reflect the changes of I-Adopt 1.1!**

## Covered Requirements

**Variable**

| Requirement                                                             | SHACL | JSON-Schema |
|-------------------------------------------------------------------------|-------|-------------|
| `Variable` needs to have an identifier.                                 | ✓     | ✓           |
| `Variable` needs to have exactly one `Property`.                        | ✓     | ✓           |
| `Variable` needs to have exactly one `ObjectOfInterest`.                | ✓     | ✓           |
| `Variable` can have up to one `Matrix`.                                 | ✓     | ✓           |
| `Variable` can have up to one `StatisticalModifier`.                    | ✓     |             |
| `Variable` can have an arbitrary number of up to one `ContextObject`s.  | ✓     | ✓           |
| All constraints of a `Variable` have to be instances of `Constraint`.   | ✓     | ✓           |

**Constraint**

| Requirement                                                                            | SHACL | JSON-Schema |
|----------------------------------------------------------------------------------------|:-----:|:-----------:|
| `Constraint` needs to be linked from at least one `Variable`.                          |   ✓   |      ✓      |
| `Constraint` needs to constrain at least one entity.                                   |   ✓   |      ✓      |
| `Constraint`s of a `Variable` need to constraint only entities of the same `Variable`. |   ✓   |      ✗      |


** System**

| Requirement                                                                                                    | SHACL | JSON-Schema |
|----------------------------------------------------------------------------------------------------------------|-------|-------------|
| `System` class can not be assigned in isolation.                                                               | ✓     |             |
| `SymmetricSystem` and `AsymmetricSystem` are disjoint.                                                         | ✓     |             |
| `SymmetricSystem` can not use asymmetric properties.                                                           | ✓     |             |
| `SymmetricSystem` has to have at least two uses of a symmetric property.                                       | ✓     | ✓           |
| `AsymmetricSystem` can not use symmetric properties.                                                           | ✓     | ✓           |
| `AsymmetricSystem` has to have at least two uses of asymmetric properties.                                     | ✓     | ✓           |
| `AsymmetricSystem` can only use properties from exactly one set of asymmetric properties.                      | ✓     | ✓           |
| Using one property from a set of asymmetric properties also requires the use of the other property of the set. | ✓     | ✓           |

Sets of asymmetric properties are
* `hasSource` and `hasTarget`
* `hasNumerator` and `hasDenominator`

Symmetric properties are
* `hasPart`

## JSON-LD & JSON-Schema

The JSON-LD schema defines the following aliases for properties as a shorthand:

* `ooi` == `objectofinterest`
* `context` == `contextobject`

## Run

* Test JSON schema: `npm run schema`
* Test SHACL shapes (without SPARQL restrictions): `npm run shacl`
* Test SHACL shapes (with SPARQL restrictions): `npm run validate`
  * requires [ISAITB/shacl-validator](https://github.com/ISAITB/shacl-validator) to be present as `validator.jar` in the root folder and Java available
