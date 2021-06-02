from google.cloud import ndb

class BaseModel(ndb.Model):
    created_at = ndb.DateTimeProperty(auto_now_add=True)
    updated_at = ndb.DateTimeProperty(auto_now=True)

class Entry(BaseModel):
    title = ndb.StringProperty()
    date = ndb.DateTimeProperty()
    twitter_ids = ndb.IntegerProperty(repeated=True)
    body = ndb.TextProperty()
    tags = ndb.StringProperty(repeated=True)
    views = ndb.IntegerProperty(default=0)
    is_published = ndb.BooleanProperty(default=True)
    is_deleted = ndb.BooleanProperty(default=False)

class Tag(BaseModel):
    name = ndb.StringProperty()
    name_lower = ndb.ComputedProperty(lambda self: self.name.lower())
    count = ndb.IntegerProperty(default=0)
