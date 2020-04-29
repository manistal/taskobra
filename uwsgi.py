
from taskobra.web import create_app
from taskobra.web.ext import db

application = create_app()

if __name__ == "__main__":
    with application.app_context():
        db.create_all()
    application.run()

