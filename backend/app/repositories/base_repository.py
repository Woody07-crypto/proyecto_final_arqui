from app.extensions import db

class BaseRepository:
    def __init__(self, model):
        self.model = model

    def get_all(self):
        return self.model.query.all()

    def get_by_id(self, id):
        return db.session.get(self.model, id)

    def save(self, instance):
        db.session.add(instance)
        db.session.commit()
        return instance

    def delete(self, instance):
        db.session.delete(instance)
        db.session.commit()

    def commit(self):
        db.session.commit()