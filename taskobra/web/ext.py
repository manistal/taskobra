from flask_sqlalchemy import SQLAlchemy
from taskobra.orm import ORMBase

db = SQLAlchemy(model_class=ORMBase) 
