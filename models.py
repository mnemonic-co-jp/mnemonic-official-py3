import re
from dateutil import tz
from google.cloud import ndb

JST = tz.gettz('Asia/Tokyo')

class BaseModel(ndb.Model):
    created_at = ndb.DateTimeProperty(auto_now_add=True, tzinfo=JST)
    updated_at = ndb.DateTimeProperty(auto_now=True, tzinfo=JST)

    def to_dict(self, include=None, exclude=None):
        result = super(BaseModel, self).to_dict(include=include, exclude=exclude)
        result['id'] = self.key.id()
        keys = result.copy().keys()
        for key in keys:
            value = result[key]
            del result[key]
            camel_key = re.sub('_(.)', lambda x: x.group(1).upper(), key)
            result[camel_key] = value
        return result

class Entry(BaseModel):
    title = ndb.StringProperty()
    date = ndb.DateTimeProperty(tzinfo=JST)
    tweet_ids = ndb.StringProperty(repeated=True)
    body = ndb.TextProperty()
    tags = ndb.StringProperty(repeated=True)
    views = ndb.IntegerProperty(default=0)
    is_published = ndb.BooleanProperty(default=True)
    is_deleted = ndb.BooleanProperty(default=False)

class Tag(BaseModel):
    name = ndb.StringProperty()
    name_lower = ndb.ComputedProperty(lambda self: self.name.lower())
    count = ndb.IntegerProperty(default=0)
