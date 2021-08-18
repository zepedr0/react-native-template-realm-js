import React from 'react';
import Realm from 'realm';

class Task {
  constructor({ id = new Realm.BSON.ObjectId(), description, isComplete = false }) {
    this._id = id;
    this.description = description;

    if (isComplete)
      this.isComplete = isComplete;
  }

  static schema = {
    name: 'Task',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      description: 'string',
      isComplete: {type: 'bool', default: false}
    }
  };
}

export default function App() {
  return null;
}
