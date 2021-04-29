[![codecov](https://codecov.io/gh/Aggtaa/mongoodm/branch/master/graph/badge.svg?token=rXv6mqf2jd)](https://codecov.io/gh/Aggtaa/mongoodm) [![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FAggtaa%2Fmongoodm.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FAggtaa%2Fmongoodm?ref=badge_shield)

# TODO
### document decorators
* @document decorators on a class register it in ODM
* alternative syntax is Registry.addDocument(User, { ... })
* multiple @document decorators are possible 
  typescript applies them in reverse order
  options are merged with Object.assign
* Registry.addDocument calls are applied after all decorators

@document()
@document({})
@document({ collection = 'users' })
@document({ collection = 'user' })
class User {
}

### field decorators
* @field decorators on a proeprty register it in ODM
  it also forces the owner class of the property to be registered
  so it is possible to not to write @document, though there is not
  way to pass document options in this case
* alternative syntax is Registry.addField(User, 'name', { ... })
* multiple @field (and other field) decorators are possible 
  typescript applies them in reverse order
  options are merged with Object.assign
* Registry.addField calls are applied after all decorators
* options.name identifies MongoDB field name within document
* options.type is used to ???
* options.name === '_id' or options.identifier === true
  force eachother and also type to ObjectID
* @identifier decorator is an alias to @field({ identifier = true })

@document({ collection = 'users' })
class User {

    @field({ identifier: true })
    @field({ name = '_id' })
    id: string;

    @field({ type = String })
    firstName: string;

    @field()
    @field({})
    @field({ name = '__name' })
    @field({ name = '__old_name' })
    name: string;
}

